import express from "express";
import { authMiddleware, optionalAuth, checkAdmin } from "../middleware/auth.middleware.js";
import {
  getProblemSolutions,
  createSolution,
  getDiscussions,
  createDiscussion,
  getDiscussionById,
  createComment,
  castVote,
  toggleFollow,
  getFollowStatus,
  getPublicProfile,
  createReport,
  getReports,
  updateReportStatus,
} from "../controllers/community.controllers.js";

const communityRoutes = express.Router();

// Solutions (per problem)
communityRoutes.get("/problems/:problemId/solutions", optionalAuth, getProblemSolutions);
communityRoutes.post("/problems/:problemId/solutions", authMiddleware, createSolution);

// Discussions
communityRoutes.get("/discussions", optionalAuth, getDiscussions);
communityRoutes.post("/discussions", authMiddleware, createDiscussion);
communityRoutes.get("/discussions/:id", optionalAuth, getDiscussionById);

// Comments
communityRoutes.post("/comments", authMiddleware, createComment);

// Votes
communityRoutes.post("/vote", authMiddleware, castVote);

// Follow
communityRoutes.post("/follow/:userId", authMiddleware, toggleFollow);
communityRoutes.get("/follow/:userId/status", authMiddleware, getFollowStatus);

// Public profile
communityRoutes.get("/profiles/:username", optionalAuth, getPublicProfile);

// Reports (moderation)
communityRoutes.post("/report", authMiddleware, createReport);
communityRoutes.get("/reports", authMiddleware, checkAdmin, getReports);
communityRoutes.patch("/reports/:id", authMiddleware, checkAdmin, updateReportStatus);

export default communityRoutes;
