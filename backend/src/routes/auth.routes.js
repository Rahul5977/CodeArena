import express from "express";
import { authMiddleware, checkRole, checkSuperAdmin } from "../middleware/auth.middleware.js";
import { UserRole } from "../generated/prisma/index.js";
import {
  register,
  login,
  legacyLogout,
  logout,
  logoutAll,
  check,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  healthCheck,
} from "../controllers/auth.controllers.js";
import {
  promoteUser,
  demoteUser,
  getAllUsers,
  getRoleChangeHistory,
  toggleUserStatus,
  getUserPermissions,
} from "../controllers/rbac.controllers.js";

const authRoutes = express.Router();

// Public routes
authRoutes.get("/health", healthCheck);
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/refresh-token", refreshToken);

// Protected routes
authRoutes.use(authMiddleware); // All routes below require authentication

// User profile routes
authRoutes.get("/profile", getProfile);
authRoutes.put("/profile", updateProfile);
authRoutes.post("/change-password", changePassword);
authRoutes.post("/logout", logout);
authRoutes.post("/logout-all", logoutAll);
authRoutes.get("/check", check);
authRoutes.get("/me", check); // Frontend expects /me (legacy)

// Legacy logout for backward compatibility
authRoutes.post("/legacy-logout", legacyLogout);

// RBAC routes - Admin and SuperAdmin only
authRoutes.get("/users", checkRole([UserRole.ADMIN, UserRole.SUPERADMIN]), getAllUsers);
authRoutes.get("/permissions/:userId?", getUserPermissions);
authRoutes.get(
  "/role-history/:userId?",
  checkRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  getRoleChangeHistory
);

// SuperAdmin only routes
authRoutes.post("/promote", checkSuperAdmin, promoteUser);
authRoutes.post("/demote", checkSuperAdmin, demoteUser);
authRoutes.patch("/users/:userId/status", checkSuperAdmin, toggleUserStatus);

export default authRoutes;
