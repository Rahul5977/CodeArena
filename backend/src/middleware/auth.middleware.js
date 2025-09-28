import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import { ApiError } from "../utils/api-error.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken || req.cookies.jwt; // Support both new and legacy tokens

    // Also check Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user - No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        promotedBy: true,
        promotedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating user", error);
    res.status(500).json({
      success: false,
      message: "Error authenticating user",
    });
  }
};
export const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Forbidden - You don't have permission to access this resource",
        });
      }
      next();
    } catch (error) {
      console.error("Error checking user role", error);
      return res.status(500).json({
        message: "Error checking user role",
      });
    }
  };
}; // Specific middleware functions
export const checkSuperAdmin = checkRole([UserRole.SUPERADMIN]);
export const checkAdmin = checkRole([UserRole.ADMIN, UserRole.SUPERADMIN]);
export const checkAdminOrSuperAdmin = checkRole([UserRole.ADMIN, UserRole.SUPERADMIN]);

//advanced permission checker
export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;

      // Define permissions matrix
      const permissions = {
        [UserRole.SUPERADMIN]: {
          users: ["create", "read", "update", "delete", "promote", "demote"],
          problems: ["create", "read", "update", "delete"],
          contests: ["create", "read", "update", "delete", "manage"],
          sheets: ["create", "read", "update", "delete", "manage"],
          system: ["manage", "configure", "audit"],
        },
        [UserRole.ADMIN]: {
          problems: ["create", "read", "update", "delete"],
          contests: ["create", "read", "update", "delete"],
          sheets: ["create", "read", "update", "delete"],
          users: ["read"], // Can only read user data, not modify roles
        },
        [UserRole.USER]: {
          problems: ["read"],
          contests: ["read", "participate"],
          sheets: ["read", "purchase"],
          profile: ["read", "update"], // Own profile only
        },
      };

      const userPermissions = permissions[userRole] || {};
      const resourcePermissions = userPermissions[resource] || [];

      if (!resourcePermissions.includes(action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${action} ${resource}`,
        });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

// Resource ownership checker
export const checkOwnership = (resourceModel, resourceIdParam = "id") => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const resourceId = req.params[resourceIdParam];

      // SuperAdmin and Admin can access any resource
      if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(userRole)) {
        return next();
      }

      // Check if user owns the resource
      const resource = await db[resourceModel].findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      if (resource.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking ownership:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking resource ownership",
      });
    }
  };
};
