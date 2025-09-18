import express from "express";
import { aiCodeReview } from "../controllers/aiCodeReview.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const aiCodeReviewRoutes = express.Router();

aiCodeReviewRoutes.post("/get-code-review", authMiddleware, aiCodeReview);

export default aiCodeReviewRoutes;
