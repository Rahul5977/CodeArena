import express from "express";
import {
  authMiddleware,
  checkAdminOrSuperAdmin,
  checkPermission,
} from "../middleware/auth.middleware.js";
import {
  createProblem,
  deleteProblem,
  getAllProblem,
  getAllProblemById,
  getAllProblemSolvedByuser,
  updateProblem,
} from "../controllers/problem.controllers.js";

const problemRoutes = express.Router();

problemRoutes.post(
  "/create-problem",
  authMiddleware,
  checkPermission("problems", "create"),
  createProblem
);
problemRoutes.get("/get-all-problems", authMiddleware, getAllProblem);
problemRoutes.get("/get-all-problems/:id", authMiddleware, getAllProblemById);
problemRoutes.put(
  "/update-problem/:id",
  authMiddleware,
  checkPermission("problems", "update"),
  updateProblem
);
problemRoutes.delete(
  "/delete-problem/:id",
  authMiddleware,
  checkPermission("problems", "delete"),
  deleteProblem
);
problemRoutes.get("/get-solved-problem", authMiddleware, getAllProblemSolvedByuser);

export default problemRoutes;
