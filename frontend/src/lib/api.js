import axios from "axios";

// Base URL: in dev, Vite proxies /api → backend (see vite.config.js).
// In prod, the SPA and API are same-origin behind the edge proxy.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Keep the session alive ────────────────────────────────────────────────
// The access token lives 15 min; the refresh token lives 7 days (httpOnly cookies).
// Without this, an expired access token 401s and the user is bounced to /login
// every 15 minutes. Here: on a 401, call /auth/refresh-token ONCE (the refresh
// cookie rides along automatically) and retry the original request. A single
// shared refreshPromise coalesces concurrent 401s into one refresh. Only a
// genuinely expired/absent refresh token surfaces the 401 → a real re-login.
let refreshPromise = null;
// Endpoints where a 401 is terminal (bad credentials / the refresh call itself) —
// never try to refresh for these, to avoid loops and misleading retries.
const NO_REFRESH = ["/auth/refresh-token", "/auth/login", "/auth/register", "/auth/logout"];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response, config } = error;
    if (!response || response.status !== 401 || !config || config._retry) return Promise.reject(error);
    if (NO_REFRESH.some((p) => (config.url || "").includes(p))) return Promise.reject(error);

    config._retry = true;
    if (!refreshPromise) {
      refreshPromise = api.post("/auth/refresh-token").finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise.then(
      () => api(config), // refresh succeeded → replay the original request
      () => Promise.reject(error), // refresh failed → surface the original 401 (real re-login)
    );
  },
);

export default api;
