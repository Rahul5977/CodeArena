import express from "express";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  createContest,
  getAllContests,
  getContestById,
  registerForContest,
  submitContestProblem,
  getLeaderboard,
  getMyContestSubmissions,
  updateContestStatus,
} from "../controllers/contest.controllers.js";

const contestRoutes = express.Router();
// Public routes (with auth)
contestRoutes.get("/", authMiddleware, getAllContests);
contestRoutes.get("/:contestId", authMiddleware, getContestById);
contestRoutes.get("/:contestId/leaderboard", authMiddleware, getLeaderboard);

// Participant routes
contestRoutes.post("/:contestId/register", authMiddleware, registerForContest);
contestRoutes.post("/:contestId/problems/:problemId/submit", authMiddleware, submitContestProblem);
contestRoutes.get("/:contestId/my-submissions", authMiddleware, getMyContestSubmissions);

// Admin routes
contestRoutes.post("/create", authMiddleware, checkAdmin, createContest);
contestRoutes.patch("/:contestId/status", authMiddleware, checkAdmin, updateContestStatus);


export default contestRoutes;
