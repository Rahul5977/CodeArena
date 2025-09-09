import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};

    if (role && Object.values(UserRole).includes(role)) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          promotedBy: true,
          promotedAt: true,
          createdAt: true,
          _count: {
            select: {
              problems: true,
              submission: true,
              problemSolved: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where: whereClause }),
    ]);

    // Get promoter details for users who were promoted
    const usersWithPromoterInfo = await Promise.all(
      users.map(async (user) => {
        if (user.promotedBy) {
          const promoter = await db.user.findUnique({
            where: { id: user.promotedBy },
            select: { name: true, email: true },
          });
          return { ...user, promotedByUser: promoter };
        }
        return user;
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithPromoterInfo,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        promotedBy: true,
        promotedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            problems: true,
            submission: true,
            problemSolved: true,
            playlists: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get promoter info if exists
    let promotedByUser = null;
    if (user.promotedBy) {
      promotedByUser = await db.user.findUnique({
        where: { id: user.promotedBy },
        select: { name: true, email: true, role: true },
      });
    }

    // Get recent role changes
    const roleChanges = await db.roleChange.findMany({
      where: { userId },
      include: {
        changedByUser: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.status(200).json({
      success: true,
      user: {
        ...user,
        promotedByUser,
        roleHistory: roleChanges,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetRole, reason } = req.body;
    const promoterId = req.user.id;
    const promoterRole = req.user.role;

    // Validate target role
    if (!Object.values(UserRole).includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target role",
      });
    }

    // Only SUPERADMIN can promote to ADMIN or SUPERADMIN
    if (
      [UserRole.ADMIN, UserRole.SUPERADMIN].includes(targetRole) &&
      promoterRole !== UserRole.SUPERADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can promote users to ADMIN or SUPERADMIN roles",
      });
    }

    // Prevent self-promotion
    if (userId === promoterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent demoting other SUPERADMINs
    if (targetUser.role === UserRole.SUPERADMIN && promoterRole !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        message: "Cannot change SUPERADMIN role",
      });
    }

    // Check if already has the target role
    if (targetUser.role === targetRole) {
      return res.status(400).json({
        success: false,
        message: `User already has the role: ${targetRole}`,
      });
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: targetRole,
          promotedBy: promoterId,
          promotedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          promotedAt: true,
        },
      });

      // Log the role change
      await prisma.roleChange.create({
        data: {
          userId,
          changedBy: promoterId,
          previousRole: targetUser.role,
          newRole: targetRole,
          reason: reason || `Role changed by ${req.user.name}`,
        },
      });

      return updatedUser;
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${targetRole} successfully`,
      user: result,
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const demoteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const demoterId = req.user.id;
    const demoterRole = req.user.role;

    // Only SUPERADMIN can demote ADMINs
    if (demoterRole !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can demote users",
      });
    }

    // Prevent self-demotion
    if (userId === demoterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot demote yourself",
      });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Can only demote ADMIN to USER
    if (targetUser.role !== UserRole.ADMIN) {
      return res.status(400).json({
        success: false,
        message: "Can only demote ADMIN users to USER role",
      });
    }

    // Use transaction
    const result = await db.$transaction(async (prisma) => {
      // Update user role to USER
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: UserRole.USER,
          promotedBy: null,
          promotedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      // Log the role change
      await prisma.roleChange.create({
        data: {
          userId,
          changedBy: demoterId,
          previousRole: targetUser.role,
          newRole: UserRole.USER,
          reason: reason || `User demoted by ${req.user.name}`,
        },
      });

      return updatedUser;
    });

    res.status(200).json({
      success: true,
      message: "User demoted to USER role successfully",
      user: result,
    });
  } catch (error) {
    console.error("Error demoting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to demote user",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = UserRole.ADMIN } = req.body;
    const creatorId = req.user.id;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Only SUPERADMIN can create ADMIN or SUPERADMIN
    if (
      [UserRole.ADMIN, UserRole.SUPERADMIN].includes(role) &&
      req.user.role !== UserRole.SUPERADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can create ADMIN or SUPERADMIN users",
      });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        promotedBy: role !== UserRole.USER ? creatorId : null,
        promotedAt: role !== UserRole.USER ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Log the creation
    if (role !== UserRole.USER) {
      await db.roleChange.create({
        data: {
          userId: newUser.id,
          changedBy: creatorId,
          previousRole: UserRole.USER,
          newRole: role,
          reason: `Account created with ${role} role by ${req.user.name}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin account",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleterId = req.user.id;
    const deleterRole = req.user.role;

    // Only SUPERADMIN can delete users
    if (deleterRole !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can delete users",
      });
    }

    // Prevent self-deletion
    if (userId === deleterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion of other SUPERADMINs
    if (targetUser.role === UserRole.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete SUPERADMIN accounts",
      });
    }

    // Log before deletion
    await db.roleChange.create({
      data: {
        userId,
        changedBy: deleterId,
        previousRole: targetUser.role,
        newRole: UserRole.USER, // Just for logging purposes
        reason: `Account deleted by ${req.user.name}`,
      },
    });

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

export const getRoleChangeHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const [roleChanges, total] = await Promise.all([
      db.roleChange.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true, email: true },
          },
          changedByUser: {
            select: { name: true, email: true, role: true },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      db.roleChange.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      roleChanges,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching role change history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role change history",
    });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const [userStats, roleStats, recentActivity] = await Promise.all([
      // User statistics
      db.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),

      // Role change statistics (last 30 days)
      db.roleChange.groupBy({
        by: ["newRole"],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: { newRole: true },
      }),

      // Recent role changes
      db.roleChange.findMany({
        take: 10,
        include: {
          user: {
            select: { name: true, email: true },
          },
          changedByUser: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        usersByRole: userStats,
        recentPromotions: roleStats,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
    });
  }
};
