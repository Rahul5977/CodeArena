import { io } from "socket.io-client";

// Authenticated by the httpOnly cookie; callers decide when to connect.
export const createSocket = () => io(import.meta.env.VITE_WS_URL || undefined, { withCredentials: true, autoConnect: false });
