import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.route.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import aiCodeReviewRoutes from "./routes/aiCodeReview.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import { initializeSocket } from "./libs/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT;
initializeSocket(server);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CodeArena API",
    features: [
      "User Authentication",
      "Problem Management",
      "Code Execution",
      "Submission Handling",
      "Playlists",
      "AI Code Review",
      "Contests",
    ],
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
// app.use("/api/v1/aiCodeReview", aiCodeReviewRoutes);
app.use("/api/v1/contests", contestRoutes);

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
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
