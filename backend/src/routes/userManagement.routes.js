import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getOnlineUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getSystemStats,
} from "../controllers/userManagement.controllers.js";

const userManagementRoutes = express.Router();

// All admin-only (single admin).
userManagementRoutes.use(authMiddleware, checkAdmin);

userManagementRoutes.get("/", getAllUsers);
userManagementRoutes.get("/stats", getSystemStats);
userManagementRoutes.get("/online", getOnlineUsers); // must precede /:userId
userManagementRoutes.get("/:userId", getUserById);
userManagementRoutes.patch("/:userId/status", toggleUserStatus);
userManagementRoutes.delete("/:userId", deleteUser);

export default userManagementRoutes;
