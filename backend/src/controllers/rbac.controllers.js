import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// Promote user role
export const promoteUser = async (req, res) => {
  try {
    const { userId, newRole, reason } = req.body;
    const promotedBy = req.user.id;
    const promoterRole = req.user.role;

    if (!userId || !newRole) {
      throw new ApiError(400, "User ID and new role are required");
    }

    // Validate new role
    if (!Object.values(UserRole).includes(newRole)) {
      throw new ApiError(400, "Invalid role");
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Role hierarchy validation
    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.ADMIN]: 1,
      [UserRole.SUPERADMIN]: 2,
    };

    const currentRoleLevel = roleHierarchy[targetUser.role];
    const newRoleLevel = roleHierarchy[newRole];
    const promoterRoleLevel = roleHierarchy[promoterRole];

    // Only SUPERADMIN can promote to SUPERADMIN
    if (newRole === UserRole.SUPERADMIN && promoterRole !== UserRole.SUPERADMIN) {
      throw new ApiError(403, "Only SUPERADMIN can promote users to SUPERADMIN");
    }

    // Can't promote to same or lower role
    if (newRoleLevel <= currentRoleLevel) {
      throw new ApiError(400, "Cannot promote user to same or lower role");
    }

    // Can't promote above your own role level
    if (newRoleLevel >= promoterRoleLevel) {
      throw new ApiError(403, "Cannot promote user to same or higher role than yours");
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        promotedBy: promotedBy,
        promotedAt: new Date(),
        refreshToken: null, // Invalidate sessions to force re-login
      },
    });

    // Log role change
    await db.roleChange.create({
      data: {
        userId,
        changedBy: promotedBy,
        previousRole: targetUser.role,
        newRole,
        reason: reason || `Promoted by ${req.user.name}`,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            promotedAt: updatedUser.promotedAt,
          },
        },
        `User promoted to ${newRole} successfully`
      )
    );
  } catch (error) {
    console.error("Error promoting user:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error promoting user",
    });
  }
};

// Demote user role
export const demoteUser = async (req, res) => {
  try {
    const { userId, newRole, reason } = req.body;
    const demotedBy = req.user.id;
    const demoterRole = req.user.role;

    if (!userId || !newRole) {
      throw new ApiError(400, "User ID and new role are required");
    }

    if (!Object.values(UserRole).includes(newRole)) {
      throw new ApiError(400, "Invalid role");
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Can't demote yourself
    if (userId === demotedBy) {
      throw new ApiError(400, "Cannot demote yourself");
    }

    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.ADMIN]: 1,
      [UserRole.SUPERADMIN]: 2,
    };

    const currentRoleLevel = roleHierarchy[targetUser.role];
    const newRoleLevel = roleHierarchy[newRole];
    const demoterRoleLevel = roleHierarchy[demoterRole];

    // Can't demote to same or higher role
    if (newRoleLevel >= currentRoleLevel) {
      throw new ApiError(400, "Cannot demote user to same or higher role");
    }

    // Can't demote users at same or higher level (unless SUPERADMIN)
    if (currentRoleLevel >= demoterRoleLevel && demoterRole !== UserRole.SUPERADMIN) {
      throw new ApiError(403, "Cannot demote user at same or higher role level");
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        refreshToken: null, // Invalidate sessions
      },
    });

    // Log role change
    await db.roleChange.create({
      data: {
        userId,
        changedBy: demotedBy,
        previousRole: targetUser.role,
        newRole,
        reason: reason || `Demoted by ${req.user.name}`,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
          },
        },
        `User demoted to ${newRole} successfully`
      )
    );
  } catch (error) {
    console.error("Error demoting user:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error demoting user",
    });
  }
};

// Get all users with role management info
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role && Object.values(UserRole).includes(role)) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await db.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        promotedBy: true,
        promotedAt: true,
        roleChanges: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            changedByUser: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await db.user.count({ where });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
        "Users fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// Get role change history
export const getRoleChangeHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = userId ? { userId } : {};

    const roleChanges = await db.roleChange.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: { name: true, email: true },
        },
        changedByUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await db.roleChange.count({ where });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          roleChanges,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
        "Role change history fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching role change history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching role change history",
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const changedBy = req.user.id;

    if (typeof isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean value");
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Can't deactivate yourself
    if (userId === changedBy) {
      throw new ApiError(400, "Cannot change your own status");
    }

    // Can't deactivate SUPERADMIN (unless you are SUPERADMIN)
    if (targetUser.role === UserRole.SUPERADMIN && req.user.role !== UserRole.SUPERADMIN) {
      throw new ApiError(403, "Cannot change SUPERADMIN status");
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isActive,
        refreshToken: !isActive ? null : undefined, // Clear sessions if deactivating
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            isActive: updatedUser.isActive,
          },
        },
        `User ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
  } catch (error) {
    console.error("Error toggling user status:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error toggling user status",
    });
  }
};

// Get user permissions
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Define permissions matrix
    const permissions = {
      [UserRole.SUPERADMIN]: {
        users: [
          "create",
          "read",
          "update",
          "delete",
          "promote",
          "demote",
          "activate",
          "deactivate",
        ],
        problems: ["create", "read", "update", "delete"],
        contests: ["create", "read", "update", "delete", "manage"],
        sheets: ["create", "read", "update", "delete", "manage"],
        playlists: ["create", "read", "update", "delete", "manage"],
        system: ["manage", "configure", "audit"],
      },
      [UserRole.ADMIN]: {
        problems: ["create", "read", "update", "delete"],
        contests: ["create", "read", "update", "delete"],
        sheets: ["create", "read", "update", "delete"],
        playlists: ["create", "read", "update", "delete"],
        users: ["read"], // Can only read user data, not modify roles
      },
      [UserRole.USER]: {
        problems: ["read"],
        contests: ["read", "participate"],
        sheets: ["read", "purchase"],
        playlists: ["read"],
        profile: ["read", "update"], // Own profile only
      },
    };

    const userPermissions = permissions[user.role] || {};

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          permissions: userPermissions,
        },
        "User permissions fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error fetching user permissions",
    });
  }
};
