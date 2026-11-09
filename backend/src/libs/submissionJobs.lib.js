import { db } from "./db.js";
import { getIO } from "./socket.js";
import { ApiError } from "../utils/api-error.js";
import { getLanguageName, pollBatchResults, submitBatch } from "./executor.lib.js";
import { scheduleLeaderboardBroadcast, updateLeaderboard } from "./contestLeaderboard.lib.js";

const ACTIVE = ["QUEUED", "RUNNING"];
const MAX_ACTIVE_JOBS_PER_USER = 3;
const SWEEP_INTERVAL_MS = 5 * 60_000;
const ABANDON_AFTER_MS = 15 * 60_000;
const PURGE_FINISHED_AFTER_MS = 24 * 60 * 60_000;
const TRANSACTION = { timeout: 20_000 };
const POINTS = { EASY: 10, MEDIUM: 20, HARD: 30 };

// Jobs being driven by this process.
const running = new Set();

const notify = (userId, id, status, result = null) =>
  getIO()?.to(`user_${userId}`).emit("submissionResult", { id, status, result });

// Moves the job to DONE. Only one finisher can win this, and it shares a
// transaction with the scoring writes, so a job that gets run twice (after a
// restart, say) still scores exactly once.
const claimFinished = async (tx, jobId, result) => {
  const { count } = await tx.submissionJob.updateMany({
    where: { id: jobId, status: { in: ACTIVE } },
    data: { status: "DONE", result },
  });
  return count === 1;
};

const judge = (results, testcases) =>
  results.map((result, i) => ({
    testCase: i + 1,
    passed: (result.stdout || "").trim() === String(testcases[i].output).trim(),
    stdout: (result.stdout || "").trim(),
    expected: String(testcases[i].output).trim(),
    stderr: result.stderr || null,
    compileOutput: result.compile_output || null,
    status: result.status?.description || "Unknown",
    memory: result.memory ? `${result.memory} KB` : null,
    time: result.time ? `${result.time} s` : null,
  }));

// What the client sees: pass/fail and timings only, never hidden I/O.
const toResult = (detailed, verdict, extra) => ({
  status: verdict,
  passed: detailed.filter((r) => r.passed).length,
  total: detailed.length,
  results: detailed.map((r) => ({ testCase: r.testCase, passed: r.passed, status: r.status, time: r.time, memory: r.memory })),
  ...extra,
});

const finishPractice = (job, problem, testcases, detailed, verdict) =>
  db.$transaction(async (tx) => {
    const result = toResult(detailed, verdict, { submissionId: job.id });
    if (!(await claimFinished(tx, job.id, result))) return null;

    const { userId, problemId } = job;
    await tx.submission.create({
      data: {
        id: job.id,
        userId,
        problemId,
        sourceCode: { code: job.sourceCode, language_id: job.languageId },
        language: getLanguageName(job.languageId),
        stdin: testcases.map((t) => t.input).join("\n"),
        stdout: JSON.stringify(detailed.map((r) => r.stdout)),
        stderr: detailed.some((r) => r.stderr) ? JSON.stringify(detailed.map((r) => r.stderr)) : null,
        compileOutput: detailed.some((r) => r.compileOutput) ? JSON.stringify(detailed.map((r) => r.compileOutput)) : null,
        status: verdict,
        memory: JSON.stringify(detailed.map((r) => r.memory)),
        time: JSON.stringify(detailed.map((r) => r.time)),
        createdAt: job.createdAt,
      },
    });
    await tx.testCaseResult.createMany({
      data: detailed.map((r) => ({
        submissionId: job.id,
        testCase: r.testCase,
        passed: r.passed,
        stdout: r.stdout,
        expected: r.expected,
        stderr: r.stderr,
        compileOutput: r.compileOutput,
        status: r.status,
        memory: r.memory,
        time: r.time,
      })),
    });

    if (verdict === "Accepted") {
      // The unique [userId, problemId] decides who gets the points, once.
      const { count } = await tx.problemSolved.createMany({ data: [{ userId, problemId }], skipDuplicates: true });
      if (count === 1) {
        await tx.user.update({ where: { id: userId }, data: { points: { increment: POINTS[problem.difficulty] ?? 10 } } });
      }
    }
    return { result, firstAC: false };
  }, TRANSACTION);

const finishContest = (job, detailed, verdict) =>
  db.$transaction(async (tx) => {
    const { userId, problemId, contestId } = job;
    // Serialize finishes for this (user, contest, problem) so two simultaneous
    // accepted attempts can't both count as the first.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${userId}:${contestId}:${problemId}`}))`;

    const existingAC = await tx.contestSubmission.findFirst({
      where: { userId, contestId, problemId, status: "Accepted" },
      select: { id: true },
    });
    const firstAC = verdict === "Accepted" && !existingAC;
    const score = firstAC ? 100 : 0;
    const result = toResult(detailed, verdict, { submissionId: job.id, score });
    if (!(await claimFinished(tx, job.id, result))) return null;

    const contest = await tx.contest.findUnique({ where: { id: contestId }, select: { startTime: true } });
    // Scored from when it was submitted, not from when judging finished.
    const penalty = firstAC ? Math.floor((job.createdAt - contest.startTime) / 60000) : 0;
    await tx.contestSubmission.create({
      data: {
        id: job.id,
        userId,
        contestId,
        problemId,
        sourceCode: { code: job.sourceCode, language_id: job.languageId },
        language: getLanguageName(job.languageId),
        status: verdict,
        score,
        penalty,
        submittedAt: job.createdAt,
      },
    });
    if (firstAC) await updateLeaderboard(tx, contestId, userId, score, penalty);
    return { result, firstAC };
  }, TRANSACTION);

const failJob = async (jobId, userId) => {
  const { count } = await db.submissionJob.updateMany({ where: { id: jobId, status: { in: ACTIVE } }, data: { status: "FAILED" } });
  if (count === 1) notify(userId, jobId, "FAILED");
};

// Drives a job to a verdict. Safe to call again for an unfinished job: tokens
// are saved before polling, so a restart picks up where this left off.
const runJob = async (jobId) => {
  if (running.has(jobId)) return;
  running.add(jobId);
  let userId;
  try {
    const job = await db.submissionJob.findUnique({ where: { id: jobId } });
    if (!job || !ACTIVE.includes(job.status)) return;
    userId = job.userId;

    const problem = await db.problem.findUnique({ where: { id: job.problemId }, select: { testcases: true, difficulty: true } });
    const testcases = problem.testcases;

    let tokens = job.tokens;
    if (tokens.length === 0) {
      const submitted = await submitBatch(
        testcases.map((tc) => ({ source_code: job.sourceCode, language_id: job.languageId, stdin: tc.input })),
      );
      tokens = submitted.map((s) => s.token);
      await db.submissionJob.update({ where: { id: jobId }, data: { tokens, status: "RUNNING" } });
    }

    const detailed = judge(await pollBatchResults(tokens), testcases);
    const verdict = detailed.every((r) => r.passed) ? "Accepted" : "Wrong Answer";
    const finished = job.contestId
      ? await finishContest(job, detailed, verdict)
      : await finishPractice(job, problem, testcases, detailed, verdict);
    if (!finished) return;

    notify(userId, jobId, "DONE", finished.result);
    if (finished.firstAC) scheduleLeaderboardBroadcast(job.contestId);
  } catch (error) {
    console.error(`Submission job ${jobId} failed:`, error);
    if (userId) await failJob(jobId, userId).catch((e) => console.error("Could not mark job failed:", e));
  } finally {
    running.delete(jobId);
  }
};

// Saves the attempt and starts judging it in the background.
export const enqueueSubmission = async ({ userId, problemId, contestId = null, sourceCode, languageId }) => {
  if (typeof sourceCode !== "string" || !Number.isInteger(languageId)) {
    throw new ApiError(400, "source_code must be a string and language_id an integer");
  }
  const active = await db.submissionJob.count({ where: { userId, status: { in: ACTIVE } } });
  if (active >= MAX_ACTIVE_JOBS_PER_USER) {
    throw new ApiError(429, "You have too many submissions being judged. Please wait for them to finish.");
  }
  const job = await db.submissionJob.create({ data: { userId, problemId, contestId, sourceCode, languageId } });
  runJob(job.id);
  return job.id;
};

// Picks up jobs nothing is driving (at startup, that's everything unfinished),
// gives up on ones too old to be worth finishing, and purges finished rows.
// With more than one process, two could pick up the same job: wasted executor
// work, but claimFinished still scores it once.
const sweepJobs = async () => {
  const now = Date.now();
  const unfinished = await db.submissionJob.findMany({
    where: { status: { in: ACTIVE } },
    select: { id: true, userId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  for (const job of unfinished) {
    if (running.has(job.id)) continue;
    if (now - job.createdAt.getTime() > ABANDON_AFTER_MS) await failJob(job.id, job.userId);
    else runJob(job.id);
  }
  await db.submissionJob.deleteMany({
    where: { status: { in: ["DONE", "FAILED"] }, updatedAt: { lt: new Date(now - PURGE_FINISHED_AFTER_MS) } },
  });
};

let sweepTimer;
export const startSubmissionJobSweeper = () => {
  if (sweepTimer) return;
  const sweep = () => sweepJobs().catch((e) => console.error("[submission-jobs]", e));
  sweep();
  sweepTimer = setInterval(sweep, SWEEP_INTERVAL_MS);
  sweepTimer.unref?.();
};
