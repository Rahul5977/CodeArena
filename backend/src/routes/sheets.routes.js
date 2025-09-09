import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  createSheet,
  getAllSheets,
  getSheetById,
  createPaymentOrder,
  verifyPayment,
  updateProgress,
  getMySheets,
  getSheetStats,
} from "../controllers/sheets.controllers.js";

const sheetsRoutes = express.Router();

// Public routes (with auth)
sheetsRoutes.get("/", authMiddleware, getAllSheets);
sheetsRoutes.get("/my-sheets", authMiddleware, getMySheets);
sheetsRoutes.get("/:sheetId", authMiddleware, getSheetById);

// Payment routes
sheetsRoutes.post("/create-order", authMiddleware, createPaymentOrder);
sheetsRoutes.post("/verify-payment", authMiddleware, verifyPayment);

// Progress routes
sheetsRoutes.post("/:sheetId/problems/:problemId/complete", authMiddleware, updateProgress);

// Admin routes
sheetsRoutes.post("/create", authMiddleware, checkAdmin, createSheet);
sheetsRoutes.get("/admin/stats", authMiddleware, checkAdmin, getSheetStats);

export default sheetsRoutes;
