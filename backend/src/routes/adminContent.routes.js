import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  getAdminProblems,
  setProblemPublished,
  deleteAdminProblem,
  getOverview,
} from "../controllers/adminContent.controllers.js";

const adminContentRoutes = express.Router();

// Single-admin dashboard — every route is admin-only.
adminContentRoutes.use(authMiddleware, checkAdmin);

adminContentRoutes.get("/overview", getOverview);
adminContentRoutes.get("/problems", getAdminProblems);
adminContentRoutes.patch("/problems/:id/publish", setProblemPublished);
adminContentRoutes.delete("/problems/:id", deleteAdminProblem);

export default adminContentRoutes;
