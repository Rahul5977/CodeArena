import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { executeCode, runCode } from "../controllers/executeCode.controllers.js";

const executionRoute = express.Router();

executionRoute.post("/", authMiddleware, executeCode); // submit against full testcases
executionRoute.post("/run", authMiddleware, runCode); // run against custom stdin

export default executionRoute;
