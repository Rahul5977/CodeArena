import { db } from "../libs/db.js";

const HEATMAP_DAYS = 154; // 22 weeks × 7 — matches the dashboard design
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

// Per-user dashboard stats: solved counts, submissions, acceptance, day streak,
// activity heatmap, recommended problems, recent activity, and a difficulty breakdown.
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = Date.now();
    const since = new Date(now - HEATMAP_DAYS * 86400000);

    const [solved, totalProblems, submissions, accepted, recent, solvedRows, me, subDates] = await Promise.all([
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
      db.problemSolved.findMany({ where: { userId }, select: { problemId: true, problem: { select: { difficulty: true } } } }),
      db.user.findUnique({ where: { id: userId }, select: { points: true } }),
      db.submission.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
    ]);

    const byDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
    for (const row of solvedRows) if (row.problem && byDifficulty[row.problem.difficulty] != null) byDifficulty[row.problem.difficulty]++;

    // Global rank by points (1 = top). Cheap: how many users have strictly more points.
    const myPoints = me?.points ?? 0;
    const [ahead, totalUsers] = await Promise.all([
      db.user.count({ where: { points: { gt: myPoints } } }),
      db.user.count(),
    ]);

    // Recommended: newest published problems the user hasn't solved yet.
    const solvedIds = solvedRows.map((r) => r.problemId);
    const recommended = await db.problem.findMany({
      where: { published: true, id: { notIn: solvedIds } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { title: true, slug: true, difficulty: true, tags: true },
    });

    // Activity heatmap + day streak from submission dates (bucketed by UTC day).
    const counts = {};
    for (const s of subDates) {
      const k = dayKey(s.createdAt);
      counts[k] = (counts[k] || 0) + 1;
    }
    const heatmap = [];
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const k = dayKey(now - i * 86400000);
      heatmap.push({ date: k, count: counts[k] || 0 });
    }
    const daySet = new Set(Object.keys(counts));
    // Current streak: consecutive days ending today (or yesterday, so it survives an un-solved today).
    let streak = 0;
    let cursor = new Date(now);
    if (!daySet.has(dayKey(cursor))) cursor = new Date(now - 86400000);
    while (daySet.has(dayKey(cursor))) {
      streak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    // Longest streak within the window.
    let longestStreak = 0;
    let run = 0;
    let prev = null;
    for (const k of [...daySet].sort()) {
      run = prev && new Date(k) - new Date(prev) === 86400000 ? run + 1 : 1;
      if (run > longestStreak) longestStreak = run;
      prev = k;
    }

    return res.status(200).json({
      success: true,
      stats: {
        solved,
        totalProblems,
        submissions,
        accepted,
        acceptanceRate: submissions ? Math.round((accepted / submissions) * 100) : 0,
        byDifficulty,
        streak,
        longestStreak,
        rank: totalUsers ? ahead + 1 : 0,
        totalUsers,
      },
      heatmap,
      recommended,
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
