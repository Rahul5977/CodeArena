import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getAllSubmission,
  getAllTheSubmissionsForProblem,
  getSubmissionsForProblem,
  getSubmissionById,
  getSubmissionJob,
} from "../controllers/submission.controllers.js";

const submissionRoutes = express.Router();
submissionRoutes.get("/get-all-submissions", authMiddleware, getAllSubmission);
submissionRoutes.get("/jobs/:id", authMiddleware, getSubmissionJob);
// NOTE: keep the more specific `/get-submission-detail/:id` before `/get-submission/:problemId`
// so Express doesn't match a submission id as a problemId.
submissionRoutes.get("/get-submission-detail/:id", authMiddleware, getSubmissionById);
submissionRoutes.get("/get-submission/:problemId", authMiddleware, getSubmissionsForProblem);
submissionRoutes.get(
  "/get-submission-count/:problemId",
  authMiddleware,
  getAllTheSubmissionsForProblem
);

export default submissionRoutes;
