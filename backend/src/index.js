import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.route.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import aiCodeReviewRoutes from "./routes/aiCodeReview.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import sheetsRoutes from "./routes/sheets.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import userManagementRoutes from "./routes/userManagement.routes.js";
import communityRoutes from "./routes/community.routes.js";
import adminContentRoutes from "./routes/adminContent.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { donationWebhook } from "./controllers/donationWebhook.controllers.js";

import { httpLogger } from "./libs/logger.js";
import { initializeSocket } from "./libs/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT;

// Behind Caddy + Cloudflare — trust the proxy so real client IPs reach the
// rate limiter and secure cookies work.
app.set("trust proxy", 1);

initializeSocket(server);

app.use(helmet({ contentSecurityPolicy: false })); // API only; CSP lives on the SPA edge
app.use(httpLogger);
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Razorpay webhook needs the RAW body for HMAC signature verification — must be
// registered before express.json() consumes it.
app.post("/api/v1/support/webhook", express.raw({ type: "application/json" }), donationWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Rate limiting (in-memory for now; swap to a Redis store for multi-process).
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts — please try again in a bit" },
});
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You're running code too quickly — give it a moment" },
});
app.use("/api/", apiLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CodeArena API",
    version: "2.0.0",
    features: ["Problems", "Contests", "DSA Sheets", "Community", "Support"],
  });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executeLimiter, executionRoute);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/aiCodeReview", aiCodeReviewRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/sheets", sheetsRoutes);
app.use("/api/v1/support", donationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/admin/users", userManagementRoutes);
app.use("/api/v1/community", communityRoutes);
app.use("/api/v1/admin/content", adminContentRoutes);
app.use("/api/v1/health", healthRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", { message: err.message, url: req.url, method: req.method });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
