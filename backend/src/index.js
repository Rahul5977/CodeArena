import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import existing routes
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.route.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import aiCodeReviewRoutes from "./routes/aiCodeReview.routes.js";
import contestRoutes from "./routes/contest.routes.js";

// Import new user management routes
import userManagementRoutes from "./routes/userManagement.routes.js";

import { initializeSocket } from "./libs/socket.js";
import sheetsRoutes from "./routes/sheets.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT;

initializeSocket(server);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to LeetLab API",
    version: "2.0.0",
    features: ["Problems", "Contests", "DSA Sheets", "AI Code Review", "Role-Based Access Control"],
  });
});

// Existing routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/aiCodeReview", aiCodeReviewRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/sheets",sheetsRoutes);

// New user management routes
app.use("/api/v1/admin/users", userManagementRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
