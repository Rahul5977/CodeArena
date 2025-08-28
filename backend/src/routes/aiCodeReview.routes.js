import express from "express";
import { aiCodeReview } from "../controllers/aiCodeReview.controllers.js";
const aiCodeReviewRoutes = express.Router();

aiCodeReviewRoutes.post("/get-code-review",aiCodeReview)
export default aiCodeReviewRoutes;