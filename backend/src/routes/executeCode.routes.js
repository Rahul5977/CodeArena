import express from "express";
import { authMiddleware, requireVerified } from "../middleware/auth.middleware.js";
import { executeCode, runCode } from "../controllers/executeCode.controllers.js";

const executionRoute = express.Router();

// Submitting a recorded solution requires a verified email; "Run" (scratch
// testing) stays open so unverified users can still try the editor.
executionRoute.post("/", authMiddleware, requireVerified, executeCode); // submit against full testcases
executionRoute.post("/run", authMiddleware, runCode); // run against custom stdin

export default executionRoute;
