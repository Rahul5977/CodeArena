import { db } from "../libs/db.js";

// Single-admin user management. Roles are USER | ADMIN and the one admin is set
// via ADMIN_EMAIL at registration, so there is no promote/demote here — the
// admin can list, view, ban/activate, and delete users, plus see who's live now.

// A user counts as "live now" if their heartbeat (lastSeenAt) landed within this
// window. The SPA pings /auth/heartbeat every 45s, so ~2.5 min tolerates one or
// two missed pings before a user drops off the live list. Kept in sync with the
// frontend via the onlineWindowMs field returned on both list endpoints.
const ONLINE_WINDOW_MS = 150 * 1000;

// Never expose secrets (password, refreshToken, reset/verification tokens) — the
// selects below are explicit allow-lists, so those columns can't leak.
const LIST_SELECT = {
  id: true, name: true, username: true, email: true, image: true, role: true,
  points: true, isActive: true, emailVerified: true, createdAt: true, lastLoginAt: true, lastSeenAt: true,
};

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { search, sort } = req.query;
    const where = search
      ? { OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ] }
      : {};

    // "recent" → most-recently-logged-in first (never-logged-in users sort last).
    const orderBy =
      sort === "recent" ? [{ lastLoginAt: { sort: "desc", nulls: "last" } }] : [{ createdAt: "desc" }];

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: LIST_SELECT,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      users,
      onlineWindowMs: ONLINE_WINDOW_MS,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({ success: false, message: "Error listing users" });
  }
};

// Users with the app open right now (recent heartbeat), most-recently-seen first.
export const getOnlineUsers = async (req, res) => {
  try {
    const since = new Date(Date.now() - ONLINE_WINDOW_MS);
    const users = await db.user.findMany({
      where: { lastSeenAt: { gte: since } },
      select: LIST_SELECT,
      orderBy: { lastSeenAt: "desc" },
    });
    return res.status(200).json({ success: true, count: users.length, onlineWindowMs: ONLINE_WINDOW_MS, users });
  } catch (error) {
    console.error("Error listing online users:", error);
    return res.status(500).json({ success: false, message: "Error listing online users" });
  }
};

// Full user detail for the admin drawer — every non-secret column, all relation
// counts, OAuth links, lifetime donations and the latest activity. Secrets
// (password, refreshToken, reset/verification tokens) are deliberately omitted.
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, username: true, email: true, image: true, bio: true,
        githubUrl: true, websiteUrl: true, role: true, points: true,
        isActive: true, emailVerified: true, createdAt: true, updatedAt: true,
        lastLoginAt: true, lastSeenAt: true,
        oauthAccounts: { select: { provider: true, providerId: true, createdAt: true } },
        _count: {
          select: {
            submissions: true, problemSolved: true, problems: true, playlists: true,
            solutions: true, discussions: true, comments: true, votes: true,
            contestParticipants: true, donations: true, followers: true, following: true,
          },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [recentSubmissions, donations] = await Promise.all([
      db.submission.findMany({
        where: { userId },
        select: { id: true, status: true, language: true, createdAt: true, problem: { select: { title: true, slug: true, difficulty: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.donation.aggregate({ _sum: { amount: true }, _count: true, where: { userId, status: "paid" } }),
    ]);

    const online = !!user.lastSeenAt && Date.now() - new Date(user.lastSeenAt).getTime() <= ONLINE_WINDOW_MS;

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        online,
        recentSubmissions,
        totalDonated: donations._sum.amount || 0,
        donationCount: donations._count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

// Ban / reactivate a user.
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) return res.status(400).json({ success: false, message: "You cannot change your own status" });

    const target = await db.user.findUnique({ where: { id: userId }, select: { isActive: true } });
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const user = await db.user.update({
      where: { id: userId },
      data: { isActive: !target.isActive, refreshToken: null },
      select: { id: true, isActive: true },
    });
    return res.status(200).json({ success: true, message: user.isActive ? "User activated" : "User banned", user });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).json({ success: false, message: "Error updating user status" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) return res.status(400).json({ success: false, message: "You cannot delete your own account here" });
    await db.user.delete({ where: { id: userId } });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "User not found" });
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

// Platform KPIs for the admin dashboard.
export const getSystemStats = async (req, res) => {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [users, activeToday, problems, submissionsToday, donations] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { lastLoginAt: { gte: dayAgo } } }),
      db.problem.count(),
      db.submission.count({ where: { createdAt: { gte: startOfDay } } }),
      db.donation.aggregate({ _sum: { amount: true }, where: { status: "paid", createdAt: { gte: startOfMonth } } }),
    ]);

    return res.status(200).json({
      success: true,
      stats: { users, activeToday, problems, submissionsToday, donationsThisMonth: donations._sum.amount || 0 },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};
