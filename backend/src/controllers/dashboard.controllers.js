import { db } from "../libs/db.js";

// Per-user dashboard stats: solved counts, submissions, acceptance, recent
// activity, and a solved-by-difficulty breakdown.
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [solved, totalProblems, submissions, accepted, recent, solvedRows] = await Promise.all([
      db.problemSolved.count({ where: { userId } }),
      db.problem.count({ where: { published: true } }),
      db.submission.count({ where: { userId } }),
      db.submission.count({ where: { userId, status: "Accepted" } }),
      db.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, status: true, language: true, createdAt: true, problem: { select: { title: true, slug: true, difficulty: true } } },
      }),
      db.problemSolved.findMany({ where: { userId }, select: { problem: { select: { difficulty: true } } } }),
    ]);

    const byDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
    for (const row of solvedRows) if (row.problem) byDifficulty[row.problem.difficulty]++;

    return res.status(200).json({
      success: true,
      stats: {
        solved,
        totalProblems,
        submissions,
        accepted,
        acceptanceRate: submissions ? Math.round((accepted / submissions) * 100) : 0,
        byDifficulty,
      },
      recent: recent.map((s) => ({
        id: s.id,
        status: s.status,
        language: s.language,
        when: s.createdAt,
        title: s.problem?.title || "Unknown",
        slug: s.problem?.slug,
        difficulty: s.problem?.difficulty,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ success: false, message: "Error loading dashboard" });
  }
};
