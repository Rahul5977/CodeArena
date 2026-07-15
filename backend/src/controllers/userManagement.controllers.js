import { db } from "../libs/db.js";

// Single-admin user management. Roles are USER | ADMIN and the one admin is set
// via ADMIN_EMAIL at registration, so there is no promote/demote here — the
// admin can list, view, ban/activate, and delete users.

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { search } = req.query;
    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: { id: true, name: true, username: true, email: true, role: true, isActive: true, emailVerified: true, createdAt: true, lastLoginAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return res.status(200).json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({ success: false, message: "Error listing users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true, name: true, username: true, email: true, image: true, bio: true,
        role: true, points: true, isActive: true, emailVerified: true, createdAt: true, lastLoginAt: true,
        _count: { select: { submissions: true, problemSolved: true, solutions: true } },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
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
