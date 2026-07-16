import { db } from "../libs/db.js";

// Global list of the current user's submissions (no source code — kept lean for the list view).
export const getAllSubmission = async (req, res) => {
  try {
    const submissions = await db.submission.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        status: true,
        language: true,
        time: true,
        memory: true,
        createdAt: true,
        problem: { select: { title: true, slug: true, difficulty: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.status(200).json({ success: true, message: "Submissions fetched successfully", submissions });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch submissions" });
  }
};

// This user's attempts for ONE problem — includes the saved source code so the editor's
// Submissions tab can show past attempts and let the user re-read their code.
export const getSubmissionsForProblem = async (req, res) => {
  try {
    const submissions = await db.submission.findMany({
      where: { userId: req.user.id, problemId: req.params.problemId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        language: true,
        time: true,
        memory: true,
        sourceCode: true,
        createdAt: true,
      },
    });
    res.status(200).json({ success: true, message: "Submissions fetched successfully", submissions });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

// One submission in full — code + verdict + per-testcase results. userId guard in the
// where clause means a user can only ever read their OWN submission's code.
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await db.submission.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        testCases: { orderBy: { testCase: "asc" } },
        problem: { select: { title: true, slug: true, difficulty: true } },
      },
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error("Fetch Submission Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch submission" });
  }
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
  try {
    const count = await db.submission.count({ where: { problemId: req.params.problemId } });
    res.status(200).json({ success: true, message: "Submissions Fetched successfully", count });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};
