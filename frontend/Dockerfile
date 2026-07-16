# CodeArena SPA — build with Node 20 (Vite 7 requires Node 20+), serve with nginx
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- serve ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
# Use 127.0.0.1 (not localhost, which resolves to IPv6 ::1 first — nginx only
# listens on IPv4, so `localhost` gave a false "unhealthy"). Hit the dedicated
# /health endpoint (access_log off) rather than the SPA index.
HEALTHCHECK --interval=30s --timeout=4s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
