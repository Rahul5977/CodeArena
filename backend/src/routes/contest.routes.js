import express from "express";
import {
  authMiddleware,
  checkAdminOrSuperAdmin,
  checkPermission,
} from "../middleware/auth.middleware.js";
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
contestRoutes.post("/create", authMiddleware, checkPermission("contests", "create"), createContest);
contestRoutes.patch(
  "/:contestId/status",
  authMiddleware,
  checkPermission("contests", "manage"),
  updateContestStatus
);

export default contestRoutes;
