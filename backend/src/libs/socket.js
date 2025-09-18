import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      });
      if (!user) {
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
    //join contest room
    socket.on("joinContest", (contestId) => {
      socket.join(`contest_${contestId}`);
      console.log(`User ${socket.user.name} joined contest room: contest_${contestId}`);
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
