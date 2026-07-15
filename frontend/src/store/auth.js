import { create } from "zustand";

// Auth store. Currently seeded with a demo user so the shell renders fully
// during the frontend rebuild. Phase 4 wires this to the real /auth endpoints
// (email+password + GitHub/Google OAuth) and hydrates from the session cookie.
export const useAuth = create((set) => ({
  user: {
    name: "Alex Rivera",
    username: "alex",
    role: "Administrator",
    isAdmin: true, // toggles the Admin nav item + /admin routes
    streak: 12,
    initials: "AR",
  },
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useAuth;
