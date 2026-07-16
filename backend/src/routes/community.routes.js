import express from "express";
import { authMiddleware, optionalAuth, checkAdmin, requireVerified } from "../middleware/auth.middleware.js";
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

// Solutions (per problem) — posting requires a verified email
communityRoutes.get("/problems/:problemId/solutions", optionalAuth, getProblemSolutions);
communityRoutes.post("/problems/:problemId/solutions", authMiddleware, requireVerified, createSolution);

// Discussions
communityRoutes.get("/discussions", optionalAuth, getDiscussions);
communityRoutes.post("/discussions", authMiddleware, requireVerified, createDiscussion);
communityRoutes.get("/discussions/:id", optionalAuth, getDiscussionById);

// Comments
communityRoutes.post("/comments", authMiddleware, requireVerified, createComment);

// Votes
communityRoutes.post("/vote", authMiddleware, requireVerified, castVote);

// Follow
communityRoutes.post("/follow/:userId", authMiddleware, requireVerified, toggleFollow);
communityRoutes.get("/follow/:userId/status", authMiddleware, getFollowStatus);

// Public profile
communityRoutes.get("/profiles/:username", optionalAuth, getPublicProfile);

// Reports (moderation)
communityRoutes.post("/report", authMiddleware, createReport);
communityRoutes.get("/reports", authMiddleware, checkAdmin, getReports);
communityRoutes.patch("/reports/:id", authMiddleware, checkAdmin, updateReportStatus);

export default communityRoutes;
