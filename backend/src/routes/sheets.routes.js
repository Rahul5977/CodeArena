import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  createSheet,
  getAllSheets,
  getSheetById,
  updateProgress,
  getSheetStats,
  addProblemsToSheet,
  removeProblemFromSheet,
} from "../controllers/sheets.controllers.js";

const sheetsRoutes = express.Router();

// Admin (declare specific paths before the /:sheetId catch)
sheetsRoutes.post("/create", authMiddleware, checkAdmin, createSheet);
sheetsRoutes.get("/admin/stats", authMiddleware, checkAdmin, getSheetStats);
sheetsRoutes.post("/:sheetId/problems", authMiddleware, checkAdmin, addProblemsToSheet);
sheetsRoutes.delete("/:sheetId/problems/:problemId", authMiddleware, checkAdmin, removeProblemFromSheet);

// Free for all authenticated users
sheetsRoutes.get("/", authMiddleware, getAllSheets);
sheetsRoutes.get("/:sheetId", authMiddleware, getSheetById);
sheetsRoutes.post("/:sheetId/problems/:problemId/complete", authMiddleware, updateProgress);

export default sheetsRoutes;
