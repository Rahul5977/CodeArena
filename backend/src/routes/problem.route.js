import express from "express";
import { authMiddleware, optionalAuth, checkPermission } from "../middleware/auth.middleware.js";
import {
  createProblem,
  deleteProblem,
  getAllProblem,
  getAllProblemById,
  getAllProblemSolvedByuser,
  updateProblem,
} from "../controllers/problem.controllers.js";

const problemRoutes = express.Router();

// Public browsing (answer-free; personalized when a valid token is present)
problemRoutes.get("/get-all-problems", optionalAuth, getAllProblem);
problemRoutes.get("/get-solved-problem", authMiddleware, getAllProblemSolvedByuser);
problemRoutes.get("/get-all-problems/:id", optionalAuth, getAllProblemById);

// Admin only
problemRoutes.post("/create-problem", authMiddleware, checkPermission("problems", "create"), createProblem);
problemRoutes.put("/update-problem/:id", authMiddleware, checkPermission("problems", "update"), updateProblem);
problemRoutes.delete("/delete-problem/:id", authMiddleware, checkPermission("problems", "delete"), deleteProblem);

export default problemRoutes;
