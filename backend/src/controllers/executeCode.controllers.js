import { pollBatchResults, submitBatch } from "../libs/executor.lib.js";
import { enqueueSubmission } from "../libs/submissionJobs.lib.js";
import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";

// SUBMIT — queue the user's code to be judged against the problem's FULL
// testcases. Responds immediately; the verdict arrives as a "submissionResult"
// socket event, or from GET /submission/jobs/:id.
export const executeCode = asyncHandler(async (req, res) => {
  const { source_code, language_id, problemId } = req.body;
  const userId = req.user.id;

  if (!source_code || !language_id || !problemId) {
    throw new ApiError(400, "source_code, language_id and problemId are required");
  }

  const problem = await db.problem.findUnique({ where: { id: problemId }, select: { testcases: true } });
  if (!problem) throw new ApiError(404, "Problem not found");
  if (!Array.isArray(problem.testcases) || problem.testcases.length === 0) {
    throw new ApiError(400, "This problem has no testcases yet");
  }

  const submissionId = await enqueueSubmission({ userId, problemId, sourceCode: source_code, languageId: language_id });
  return res.status(202).json({ success: true, submissionId, status: "QUEUED" });
});

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
