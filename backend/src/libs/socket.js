import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { db } from "./db.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      // Match the Express CORS origin so sockets aren't rejected in prod
      // (browser Origin must equal the configured frontend origin).
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.engine.use(cookieParser());
  // Middleware to authenticate socket connections. Browsers authenticate with
  // the httpOnly cookie; handshake.auth.token is for non-browser clients.
  io.use(async (socket, next) => {
    const { accessToken, jwt: legacyToken } = socket.request.cookies || {};
    const token = accessToken || legacyToken || socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
      if (!user?.isActive) {
        return next(new Error("Authentication error"));
      }
      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });
  io.on("connection", (socket) => {
    console.log(`User ${socket.user.name} connected: ${socket.id}`);
    socket.join(`user_${socket.userId}`); // verdicts for this user's submissions
    //join contest room
    socket.on("joinContest", (contestId, ack) => {
      if (typeof contestId !== "string") return;
      socket.join(`contest_${contestId}`);
      console.log(`User ${socket.user.name} joined contest room: contest_${contestId}`);
      if (typeof ack === "function") ack();
    });
    //leave contest room
    socket.on("leaveContest", (contestId) => {
      socket.leave(`contest_${contestId}`);
      console.log(`User ${socket.user.name} left contest room: contest_${contestId}`);
    });
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.name} disconnected`);
    });
  });
  return io;
};

// Lazy accessor for the module-scoped io instance (undefined before init).
export const getIO = () => io;
