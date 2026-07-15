import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getGlobalLeaderboard } from "../controllers/leaderboard.controllers.js";

const leaderboardRoutes = express.Router();

leaderboardRoutes.get("/", authMiddleware, getGlobalLeaderboard);

export default leaderboardRoutes;
