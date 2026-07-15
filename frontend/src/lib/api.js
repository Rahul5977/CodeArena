import axios from "axios";

// Base URL: in dev, Vite proxies /api → backend (see vite.config.js).
// In prod, the SPA and API are same-origin behind the edge proxy.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
