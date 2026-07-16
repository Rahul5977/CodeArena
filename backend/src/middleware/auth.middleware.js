import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

// Single-admin model (rewamp): roles are USER | ADMIN. SUPERADMIN and the
// promote/demote machinery are gone. The old export names are kept as aliases
// so existing route files keep working; they all collapse to "is this an admin".

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken || req.cookies.jwt;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account is deactivated" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating user", error);
    res.status(500).json({ success: false, message: "Error authenticating user" });
  }
};

// Attaches req.user when a valid token is present, but never rejects — for
// public-but-personalizable reads (e.g. the problem list).
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken || req.cookies.jwt;
    if (!token && req.headers.authorization) token = req.headers.authorization.replace("Bearer ", "");
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await db.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, username: true, email: true, image: true, role: true, isActive: true, emailVerified: true },
        });
        if (user?.isActive) req.user = user;
      } catch {
        /* invalid token → treat as anonymous */
      }
    }
    next();
  } catch {
    next();
  }
};

// Gate write/participation actions on a verified email. OAuth sign-ups are
// auto-verified (the provider vouched for the address); email/password users
// must click the verification link first. Reads stay open.
export const requireVerified = (req, res, next) => {
  if (req.user?.emailVerified) return next();
  return res.status(403).json({
    success: false,
    code: "EMAIL_NOT_VERIFIED",
    message: "Please verify your email to do this — check your inbox, or resend the link from the banner.",
  });
};

export const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You don't have permission to access this resource",
      });
    }
    next();
  };
};

// The single admin gate. Aliases preserve old imports (no SUPERADMIN anymore).
export const checkAdmin = checkRole(["ADMIN"]);
export const checkSuperAdmin = checkAdmin;
export const checkAdminOrSuperAdmin = checkAdmin;

// Simplified permission check (USER | ADMIN). Admins can manage everything;
// users get read/participate/own-profile actions.
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (role === "ADMIN") return next();

    const userAllowed = {
      problems: ["read"],
      contests: ["read", "participate"],
      sheets: ["read"],
      profile: ["read", "update"],
    };
    if ((userAllowed[resource] || []).includes(action)) return next();

    return res.status(403).json({
      success: false,
      message: `Access denied. You don't have permission to ${action} ${resource}`,
    });
  };
};

// Resource ownership — admins bypass; others must own the row. `ownerField`
// defaults to userId (playlists, submissions); pass "authorId" for problems.
export const checkOwnership = (resourceModel, resourceIdParam = "id", ownerField = "userId") => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === "ADMIN") return next();

      const resource = await db[resourceModel].findUnique({
        where: { id: req.params[resourceIdParam] },
        select: { [ownerField]: true },
      });
      if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
      if (resource[ownerField] !== req.user.id) {
        return res.status(403).json({ success: false, message: "Access denied. You can only access your own resources" });
      }
      next();
    } catch (error) {
      console.error("Error checking ownership:", error);
      return res.status(500).json({ success: false, message: "Error checking resource ownership" });
    }
  };
};
