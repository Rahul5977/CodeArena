import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { submitBatch, pollBatchResults, getLanguageName } from "../libs/executor.lib.js";
import { getIO } from "../libs/socket.js";

// Answer-free projection used everywhere a registered participant reads a
// contest problem. Excludes testcases/referenceSolutions (the answers).
const CONTEST_PROBLEM_SELECT = {
  id: true,
  slug: true,
  title: true,
  difficulty: true,
  tags: true,
  description: true,
  examples: true,
  constraints: true,
  codeSnippets: true,
};

// Derive the live status from the clock; only CANCELLED is trusted from storage.
const deriveStatus = (contest, now = new Date()) => {
  if (contest.status === "CANCELLED") return "CANCELLED";
  if (now < contest.startTime) return "UPCOMING";
  if (now > contest.endTime) return "COMPLETED";
  return "LIVE";
};

export const createContest = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, duration, problemIds, maxParticipants, rules } =
    req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (!title) throw new ApiError(400, "Title is required");
  if (start <= now) throw new ApiError(400, "Start time must be in the future");
  if (end <= start) throw new ApiError(400, "End time must be after start time");

  const windowMinutes = (end - start) / (1000 * 60);
  if (!duration || duration <= 0 || duration > windowMinutes) {
    throw new ApiError(400, "Duration must be positive and within the contest window");
  }

  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "At least one problem is required");
  }
  const problems = await db.problem.findMany({ where: { id: { in: problemIds } }, select: { id: true } });
  if (problems.length !== problemIds.length) {
    throw new ApiError(400, "One or more problems do not exist");
  }

  const contest = await db.contest.create({
    data: {
      title,
      description,
      startTime: start,
      endTime: end,
      duration,
      problemIds,
      maxParticipants: maxParticipants ?? null,
      rules: rules || {},
    },
  });

  return res.status(201).json({ success: true, message: "Contest created successfully", contest });
});

export const getAllContests = asyncHandler(async (req, res) => {
  const { status = "all", page = 1, limit = 10 } = req.query;
  const now = new Date();

  const where = {};
  if (status === "upcoming") {
    where.startTime = { gt: now };
  } else if (status === "ongoing") {
    where.startTime = { lte: now };
    where.endTime = { gte: now };
  } else if (status === "past") {
    where.endTime = { lt: now };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [contests, total] = await Promise.all([
    db.contest.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { startTime: "desc" },
      include: { _count: { select: { participants: true } } },
    }),
    db.contest.count({ where }),
  ]);

  const withStatus = contests.map((c) => ({ ...c, status: deriveStatus(c, now) }));

  return res.status(200).json({
    success: true,
    contests: withStatus,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getContestById = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user.id;

  const contest = await db.contest.findUnique({
    where: { id: contestId },
    include: { _count: { select: { participants: true } } },
  });
  if (!contest) throw new ApiError(404, "Contest not found");

  const now = new Date();
  const participant = await db.contestParticipant.findUnique({
    where: { userId_contestId: { userId, contestId } },
  });
  const isRegistered = !!participant;
  const hasStarted = now >= contest.startTime;
  const hasEnded = now > contest.endTime;
  const status = deriveStatus(contest, now);
  const participantCount = contest._count.participants;

  let problems = [];
  if (isRegistered && status === "LIVE") {
    problems = await db.problem.findMany({
      where: { id: { in: contest.problemIds } },
      select: CONTEST_PROBLEM_SELECT,
    });
  }

  return res.status(200).json({
    success: true,
    contest: {
      ...contest,
      problems,
      isRegistered,
      hasStarted,
      hasEnded,
      participantCount,
      status,
    },
  });
});

export const registerForContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user.id;

  const contest = await db.contest.findUnique({
    where: { id: contestId },
    include: { _count: { select: { participants: true } } },
  });
  if (!contest) throw new ApiError(404, "Contest not found");

  const now = new Date();
  if (now >= contest.startTime) {
    throw new ApiError(400, "Cannot register for a contest that has already started");
  }
  if (contest.maxParticipants && contest._count.participants >= contest.maxParticipants) {
    throw new ApiError(400, "Contest is full");
  }

  const existingParticipant = await db.contestParticipant.findUnique({
    where: { userId_contestId: { userId, contestId } },
  });
  if (existingParticipant) {
    throw new ApiError(400, "User is already registered for the contest");
  }

  await db.contestParticipant.create({
    data: { userId, contestId, registeredAt: new Date() },
  });

  return res.status(200).json({ success: true, message: "Registered for contest successfully" });
});

export const getContestProblem = asyncHandler(async (req, res) => {
  const { contestId, problemId } = req.params;
  const userId = req.user.id;

  const contest = await db.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new ApiError(404, "Contest not found");

  const participant = await db.contestParticipant.findUnique({
    where: { userId_contestId: { userId, contestId } },
  });
  if (!participant) throw new ApiError(403, "User is not registered for the contest");

  const now = new Date();
  if (now < contest.startTime || now > contest.endTime) {
    throw new ApiError(400, "Contest is not currently live");
  }
  if (!contest.problemIds.includes(problemId)) {
    throw new ApiError(400, "Problem is not part of the contest");
  }

  const problem = await db.problem.findUnique({
    where: { id: problemId },
    select: CONTEST_PROBLEM_SELECT,
  });
  if (!problem) throw new ApiError(404, "Problem not found");

  return res.status(200).json({ success: true, problem });
});

export const submitContestProblem = asyncHandler(async (req, res) => {
  const { contestId, problemId } = req.params;
  const { source_code, language_id } = req.body;
  const userId = req.user.id;

  if (!source_code || !language_id) {
    throw new ApiError(400, "source_code and language_id are required");
  }

  const contest = await db.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new ApiError(404, "Contest not found");

  const participant = await db.contestParticipant.findUnique({
    where: { userId_contestId: { userId, contestId } },
  });
  if (!participant) throw new ApiError(403, "User is not registered for the contest");

  const now = new Date();
  if (now < contest.startTime || now > contest.endTime) {
    throw new ApiError(400, "Contest is not currently live");
  }
  if (!contest.problemIds.includes(problemId)) {
    throw new ApiError(400, "Problem is not part of the contest");
  }

  // Anti-flood: cap submissions per (user, contest, problem) in the last minute.
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const recentSubmissions = await db.contestSubmission.count({
    where: { userId, contestId, problemId, submittedAt: { gte: oneMinuteAgo } },
  });
  if (recentSubmissions >= 5) {
    throw new ApiError(429, "Too many submissions in a short period. Please wait before submitting again.");
  }

  const problem = await db.problem.findUnique({ where: { id: problemId } });
  if (!problem) throw new ApiError(404, "Problem not found");

  const testcases = problem.testcases || [];
  if (!Array.isArray(testcases) || testcases.length === 0) {
    throw new ApiError(400, "This problem has no testcases yet");
  }
  const submissions = testcases.map((tc) => ({ source_code, language_id, stdin: tc.input }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((sub) => sub.token);
  const results = await pollBatchResults(tokens);

  let allPassed = true;
  const detailedResults = results.map((result, index) => {
    const stdout = (result.stdout || "").trim();
    const expected = (testcases[index].output || "").trim();
    const passed = stdout === expected;
    if (!passed) allPassed = false;
    return { testCase: index + 1, passed, status: result.status?.description || "Unknown" };
  });

  const penaltyMinutes = Math.floor((now - contest.startTime) / 60000);

  const existingAC = await db.contestSubmission.findFirst({
    where: { userId, contestId, problemId, status: "Accepted" },
  });
  const firstAC = allPassed && !existingAC;
  const score = firstAC ? 100 : 0;

  await db.contestSubmission.create({
    data: {
      userId,
      contestId,
      problemId,
      sourceCode: { code: source_code, language_id },
      language: getLanguageName(language_id),
      status: allPassed ? "Accepted" : "Wrong Answer",
      score,
      penalty: firstAC ? penaltyMinutes : 0,
    },
  });

  if (firstAC) {
    await updateLeaderboard(contestId, userId, 100, penaltyMinutes);
    getIO()?.to(`contest_${contestId}`).emit("leaderboardUpdate", await getContestLeaderboardData(contestId));
  }

  return res.status(200).json({
    success: true,
    status: allPassed ? "Accepted" : "Wrong Answer",
    passed: detailedResults.filter((r) => r.passed).length,
    total: detailedResults.length,
    results: detailedResults,
    score,
  });
});

// Plain helper — upsert the leaderboard row for (user, contest).
export const updateLeaderboard = async (contestId, userId, scoreToAdd, penaltyToAdd = 0) => {
  await db.contestLeaderboard.upsert({
    where: { userId_contestId: { userId, contestId } },
    update: {
      totalScore: { increment: scoreToAdd },
      penalty: { increment: penaltyToAdd },
      problemsSolved: { increment: 1 },
      lastSubmission: new Date(),
    },
    create: {
      userId,
      contestId,
      totalScore: scoreToAdd,
      penalty: penaltyToAdd,
      problemsSolved: 1,
      lastSubmission: new Date(),
    },
  });
};

// Plain helper — the ranked leaderboard array for a contest.
export const getContestLeaderboardData = async (contestId) => {
  const leaderboard = await db.contestLeaderboard.findMany({
    where: { contestId },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: [{ totalScore: "desc" }, { penalty: "asc" }, { lastSubmission: "asc" }],
  });

  return leaderboard.map((entry, i) => ({
    rank: i + 1,
    userId: entry.userId,
    user: entry.user,
    totalScore: entry.totalScore,
    penalty: entry.penalty,
    problemsSolved: entry.problemsSolved,
    lastSubmission: entry.lastSubmission,
  }));
};

export const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await getContestLeaderboardData(req.params.contestId);
  return res.status(200).json({ success: true, leaderboard });
});

export const getMyContestSubmissions = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user.id;

  const submissions = await db.contestSubmission.findMany({
    where: { userId, contestId },
    include: { problem: { select: { id: true, title: true, difficulty: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return res.status(200).json({ success: true, submissions });
});

export const updateContestStatus = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { status } = req.body;

  const contest = await db.contest.update({
    where: { id: contestId },
    data: { status },
  });

  return res.status(200).json({ success: true, message: "Contest status updated successfully", contest });
});

export const updateContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { title, description, startTime, endTime, duration, problemIds, maxParticipants } = req.body;

  const existing = await db.contest.findUnique({ where: { id: contestId } });
  if (!existing) throw new ApiError(404, "Contest not found");

  if (problemIds !== undefined) {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      throw new ApiError(400, "At least one problem is required");
    }
    const problems = await db.problem.findMany({ where: { id: { in: problemIds } }, select: { id: true } });
    if (problems.length !== problemIds.length) {
      throw new ApiError(400, "One or more problems do not exist");
    }
  }

  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (startTime !== undefined) data.startTime = new Date(startTime);
  if (endTime !== undefined) data.endTime = new Date(endTime);
  if (duration !== undefined) data.duration = duration;
  if (problemIds !== undefined) data.problemIds = problemIds;
  if (maxParticipants !== undefined) data.maxParticipants = maxParticipants ?? null;

  const contest = await db.contest.update({ where: { id: contestId }, data });

  return res.status(200).json({ success: true, contest });
});

export const deleteContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  const existing = await db.contest.findUnique({ where: { id: contestId } });
  if (!existing) throw new ApiError(404, "Contest not found");

  await db.contest.delete({ where: { id: contestId } });

  return res.status(200).json({ success: true, message: "Contest deleted successfully" });
});
