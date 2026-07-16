import { create } from "zustand";
import { api } from "../lib/api.js";

// Shapes the backend user into what the UI needs (initials, isAdmin, display role).
const shape = (u) =>
  u && {
    ...u,
    isAdmin: u.role === "ADMIN",
    role: u.role === "ADMIN" ? "Administrator" : "Member",
    emailVerified: u.emailVerified ?? false,
    streak: u.streak ?? 0,
    initials: (u.name || u.email || "?")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
  };

export const useAuth = create((set) => ({
  user: null,
  status: "loading", // loading | authenticated | anonymous

  // Called once on app load — restores the session from the httpOnly cookie.
  hydrate: async () => {
    try {
      const { data } = await api.get("/auth/me");
      const u = shape(data?.data?.user);
      set({ user: u, status: u ? "authenticated" : "anonymous" });
    } catch {
      set({ user: null, status: "anonymous" });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    set({ user: shape(data?.data?.user), status: "authenticated" });
  },

  register: async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    set({ user: shape(data?.data?.user), status: "authenticated" });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    set({ user: null, status: "anonymous" });
  },
}));

export default useAuth;
