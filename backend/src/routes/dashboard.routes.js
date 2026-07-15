import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getDashboard } from "../controllers/dashboard.controllers.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/", authMiddleware, getDashboard);

export default dashboardRoutes;
