import express from "express";
import { db } from "../libs/db.js";

const healthRoutes = express.Router();

// Liveness + readiness probe. Mounted at /api/v1/health by the orchestrator.
// Always responds 200 with a JSON body; a failing DB check is reported as
// db:false rather than crashing the endpoint.
healthRoutes.get("/", async (req, res) => {
  let db_ok = false;
  try {
    await db.$queryRaw`SELECT 1`;
    db_ok = true;
  } catch {
    db_ok = false;
  }

  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: db_ok,
  });
});

export default healthRoutes;
