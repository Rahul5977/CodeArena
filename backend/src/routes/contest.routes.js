import express from "express";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  createContest,
  getAllContests,
  getContestById,
  registerForContest,
  submitContestProblem,
  getContestLeaderboard,
  getLeaderboard,
  updateLeaderboard,
  getMyContestSubmissions,
  updateContestStatus,
} from "../controllers/contest.controllers.js";

const contestRoutes = express.Router();
contestRoutes.post("/", authMiddleware, checkAdmin, createContest);
contestRoutes.get("/", getAllContests);
contestRoutes.get("/:id", getContestById);
contestRoutes.post("/:id/register", authMiddleware, registerForContest);
contestRoutes.post("/:id/submit", authMiddleware, submitContestProblem);
contestRoutes.get("/:id/leaderboard", getContestLeaderboard);
contestRoutes.get("/:id/leaderboard/full", authMiddleware, getLeaderboard);
contestRoutes.put("/:id/leaderboard", authMiddleware, checkAdmin, updateLeaderboard);
contestRoutes.get("/:id/submissions", authMiddleware, getMyContestSubmissions);
contestRoutes.patch("/:id/status", authMiddleware, checkAdmin, updateContestStatus);

export default contestRoutes;
