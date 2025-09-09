import express from "express";
import {
  authMiddleware,
  checkSuperAdmin,
  checkAdminOrSuperAdmin,
  checkPermission,
} from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getUserById,
  promoteUser,
  demoteUser,
  createAdmin,
  deleteUser,
  getRoleChangeHistory,
  getSystemStats,
} from "../controllers/userManagement.controllers.js";

const userManagementRoutes = express.Router();

// All routes require authentication
userManagementRoutes.use(authMiddleware);

// User listing and details (Admin+ can access)
userManagementRoutes.get("/", checkAdminOrSuperAdmin, getAllUsers);
userManagementRoutes.get("/stats", checkSuperAdmin, getSystemStats);
userManagementRoutes.get("/role-history", checkSuperAdmin, getRoleChangeHistory);
userManagementRoutes.get("/:userId", checkAdminOrSuperAdmin, getUserById);

// Role management (SUPERADMIN only)
userManagementRoutes.post("/create-admin", checkSuperAdmin, createAdmin);
userManagementRoutes.patch("/:userId/promote", checkSuperAdmin, promoteUser);
userManagementRoutes.patch("/:userId/demote", checkSuperAdmin, demoteUser);
userManagementRoutes.delete("/:userId", checkSuperAdmin, deleteUser);

export default userManagementRoutes;
