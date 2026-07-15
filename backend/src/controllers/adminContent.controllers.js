import { db } from "../libs/db.js";

// Admin content management + dashboard overview. Every handler here is mounted
// behind authMiddleware + checkAdmin (single-admin model), so req.user is the
// admin and no per-row ownership checks are needed.

// GET /problems — admin problem list. Unlike the public list this always
// returns drafts too, plus a submission count for each problem.
// Query: ?search, ?status=all|published|draft, ?page, ?limit.
export const getAdminProblems = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { search } = req.query;
    const status = req.query.status || "all";

    const where = {};
    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;
    // status === "all" (or anything else) → no published filter

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      db.problem.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          tags: true,
          published: true,
          createdAt: true,
          _count: { select: { submission: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.problem.count({ where }),
    ]);

    const problems = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      published: p.published,
      createdAt: p.createdAt,
      submissionCount: p._count.submission,
    }));

    return res.status(200).json({
      success: true,
      problems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error listing admin problems:", error);
    return res.status(500).json({ success: false, message: "Error listing problems" });
  }
};

// PATCH /problems/:id/publish — { published: bool }. Publish or unpublish.
export const setProblemPublished = async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    if (typeof published !== "boolean") {
      return res.status(400).json({ success: false, message: "`published` must be a boolean" });
    }

    const problem = await db.problem.update({
      where: { id },
      data: { published },
      select: { id: true, published: true },
    });

    return res.status(200).json({
      success: true,
      message: problem.published ? "Problem published" : "Problem unpublished",
      problem,
    });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Problem not found" });
    console.error("Error updating publish state:", error);
    return res.status(500).json({ success: false, message: "Error updating problem" });
  }
};

// DELETE /problems/:id
export const deleteAdminProblem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.problem.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Problem deleted" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Problem not found" });
    console.error("Error deleting problem:", error);
    return res.status(500).json({ success: false, message: "Error deleting problem" });
  }
};

// GET /overview — dashboard KPIs + recent signups + a 14-day submissions series.
export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of the 14-day window (local midnight, 13 days before today).
    const DAYS = 14;
    const windowStart = new Date(startOfDay);
    windowStart.setDate(windowStart.getDate() - (DAYS - 1));

    const [
      totalUsers,
      activeToday,
      submissionsToday,
      donations,
      problemCount,
      openReports,
      recentSignups,
      windowSubmissions,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { lastLoginAt: { gte: dayAgo } } }),
      db.submission.count({ where: { createdAt: { gte: startOfDay } } }),
      db.donation.aggregate({ _sum: { amount: true }, where: { status: "paid", createdAt: { gte: startOfMonth } } }),
      db.problem.count(),
      db.report.count({ where: { status: "open" } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      db.submission.findMany({
        where: { createdAt: { gte: windowStart } },
        select: { createdAt: true },
      }),
    ]);

    // Bucket submissions into 14 daily counts (index 0 = oldest day).
    const submissionsPerDay = new Array(DAYS).fill(0);
    const submissionDays = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(windowStart);
      d.setDate(windowStart.getDate() + i);
      submissionDays.push(d.toISOString());
    }
    for (const s of windowSubmissions) {
      const day = new Date(s.createdAt);
      day.setHours(0, 0, 0, 0);
      const idx = Math.round((day.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000));
      if (idx >= 0 && idx < DAYS) submissionsPerDay[idx]++;
    }

    return res.status(200).json({
      success: true,
      kpis: {
        totalUsers,
        activeToday,
        submissionsToday,
        donationsThisMonth: donations._sum.amount || 0,
        problemCount,
        openReports,
      },
      recentSignups,
      submissionsPerDay,
      submissionDays,
    });
  } catch (error) {
    console.error("Error building admin overview:", error);
    return res.status(500).json({ success: false, message: "Error loading overview" });
  }
};
