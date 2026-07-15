import { db } from "../libs/db.js";

export const getAllSubmission = async (req, res) => {
  try {
    const submissions = await db.submission.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        status: true,
        language: true,
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

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const submissions = await db.submission.findMany({
      where: { userId: req.user.id, problemId: req.params.problemId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, message: "Submission fetched successfully", submissions });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
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
