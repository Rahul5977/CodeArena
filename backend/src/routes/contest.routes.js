import express from "express";
import { authMiddleware, checkPermission } from "../middleware/auth.middleware.js";
import {
  createContest,
  getAllContests,
  getContestById,
  registerForContest,
  getContestProblem,
  submitContestProblem,
  getLeaderboard,
  getMyContestSubmissions,
  updateContest,
  updateContestStatus,
  deleteContest,
} from "../controllers/contest.controllers.js";

const contestRoutes = express.Router();

// Public routes (with auth)
contestRoutes.get("/", authMiddleware, getAllContests);
contestRoutes.get("/:contestId", authMiddleware, getContestById);
contestRoutes.get("/:contestId/leaderboard", authMiddleware, getLeaderboard);

// Participant routes
contestRoutes.post("/:contestId/register", authMiddleware, registerForContest);
contestRoutes.get("/:contestId/problems/:problemId", authMiddleware, getContestProblem);
contestRoutes.post("/:contestId/problems/:problemId/submit", authMiddleware, submitContestProblem);
contestRoutes.get("/:contestId/my-submissions", authMiddleware, getMyContestSubmissions);

// Admin routes
contestRoutes.post("/create", authMiddleware, checkPermission("contests", "create"), createContest);
contestRoutes.put("/:contestId", authMiddleware, checkPermission("contests", "manage"), updateContest);
contestRoutes.delete("/:contestId", authMiddleware, checkPermission("contests", "manage"), deleteContest);
contestRoutes.patch(
  "/:contestId/status",
  authMiddleware,
  checkPermission("contests", "manage"),
  updateContestStatus
);

export default contestRoutes;
