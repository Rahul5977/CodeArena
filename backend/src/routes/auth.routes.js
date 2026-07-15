import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
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

const authRoutes = express.Router();

// Public
authRoutes.get("/health", healthCheck);
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/refresh-token", refreshToken);

// Protected
authRoutes.use(authMiddleware);
authRoutes.get("/profile", getProfile);
authRoutes.put("/profile", updateProfile);
authRoutes.post("/change-password", changePassword);
authRoutes.post("/logout", logout);
authRoutes.post("/logout-all", logoutAll);
authRoutes.get("/check", check);
authRoutes.get("/me", check); // frontend expects /me
authRoutes.post("/legacy-logout", legacyLogout);

export default authRoutes;
