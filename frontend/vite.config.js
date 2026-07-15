import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      // Local dev proxies to the backend on localhost; in Docker, override with
      // VITE_PROXY_TARGET=http://backend:8080.
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
