import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import {db} from "./db.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await db.user.findUnique({where: {id: decoded.id}},
                {select: {id: true, username: true, email: true, role: true}});
            if (!user) {
                return next(new Error("Authentication error"));
            }
            socket.userId=user.id;
            socket.user=user;
            next();
        } catch (err) {
            return next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`User ${socket.user.username} connected: `);
        //join contest room
        socket.on("joinContest", (contestId) => {
            socket.join(`contest_${contestId}`);
            console.log(`User ${socket.user.username} joined contest room: contest_${contestId}`);
        });
        //leave contest room
        socket.on("leaveContest", (contestId) => {
            socket.leave(`contest_${contestId}`);
            console.log(`User ${socket.user.username} left contest room: contest_${contestId}`);
        });
        socket.on("disconnect", () => {
            console.log(`User ${socket.user.username} disconnected`);
        });
    });  
    return io;  
};
