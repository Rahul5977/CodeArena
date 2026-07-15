import { getLanguageName, pollBatchResults, submitBatch } from "../libs/executor.lib.js";
import { db } from "../libs/db.js";

// SUBMIT — run the user's code against the problem's FULL testcases, fetched
// server-side so the client never sees hidden cases. Records a Submission and
// returns a safe per-testcase verdict (pass/fail + timings, no hidden I/O).
export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, problemId } = req.body;
    const userId = req.user.id;

    if (!source_code || !language_id || !problemId) {
      return res.status(400).json({ success: false, message: "source_code, language_id and problemId are required" });
    }

    const problem = await db.problem.findUnique({ where: { id: problemId }, select: { id: true, testcases: true } });
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    const testcases = Array.isArray(problem.testcases) ? problem.testcases : [];
    if (testcases.length === 0) {
      return res.status(400).json({ success: false, message: "This problem has no testcases yet" });
    }

    const submissions = testcases.map((tc) => ({ source_code, language_id, stdin: tc.input }));
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((r) => r.token);
    const results = await pollBatchResults(tokens);

    let allPassed = true;
    const detailed = results.map((result, i) => {
      const stdout = (result.stdout || "").trim();
      const expected = String(testcases[i].output).trim();
      const passed = stdout === expected;
      if (!passed) allPassed = false;
      return {
        testCase: i + 1,
        passed,
        stdout,
        expected,
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status?.description || "Unknown",
        memory: result.memory ? `${result.memory} KB` : null,
        time: result.time ? `${result.time} s` : null,
      };
    });

    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: { code: source_code, language_id },
        language: getLanguageName(language_id),
        stdin: testcases.map((t) => t.input).join("\n"),
        stdout: JSON.stringify(detailed.map((r) => r.stdout)),
        stderr: detailed.some((r) => r.stderr) ? JSON.stringify(detailed.map((r) => r.stderr)) : null,
        compileOutput: detailed.some((r) => r.compileOutput) ? JSON.stringify(detailed.map((r) => r.compileOutput)) : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: JSON.stringify(detailed.map((r) => r.memory)),
        time: JSON.stringify(detailed.map((r) => r.time)),
      },
    });

    await db.testCaseResult.createMany({
      data: detailed.map((r) => ({
        submissionId: submission.id,
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

    if (allPassed) {
      await db.problemSolved.upsert({
        where: { userId_problemId: { userId, problemId } },
        update: {},
        create: { userId, problemId },
      });
    }

    return res.status(200).json({
      success: true,
      submissionId: submission.id,
      status: allPassed ? "Accepted" : "Wrong Answer",
      passed: detailed.filter((r) => r.passed).length,
      total: detailed.length,
      results: detailed.map((r) => ({ testCase: r.testCase, passed: r.passed, status: r.status, time: r.time, memory: r.memory })),
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return res.status(500).json({
      success: false,
      message: "Error running your code",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// RUN — execute against a single custom stdin (e.g. an example the user tweaked).
// Returns the raw output; no DB writes, no hidden testcases.
export const runCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin = "" } = req.body;
    if (!source_code || !language_id) {
      return res.status(400).json({ success: false, message: "source_code and language_id are required" });
    }
    const submitResponse = await submitBatch([{ source_code, language_id, stdin }]);
    const tokens = submitResponse.map((r) => r.token);
    const [result] = await pollBatchResults(tokens);
    return res.status(200).json({
      success: true,
      stdout: result.stdout || "",
      stderr: result.stderr || null,
      compileOutput: result.compile_output || null,
      status: result.status?.description || "Unknown",
      time: result.time ? `${result.time} s` : null,
      memory: result.memory ? `${result.memory} KB` : null,
    });
  } catch (error) {
    console.error("Run error:", error);
    return res.status(500).json({
      success: false,
      message: "Error running your code",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
