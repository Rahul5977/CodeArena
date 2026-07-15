# CodeArena API
FROM node:20-alpine

WORKDIR /app

# Install deps (full — prisma CLI is needed for generate/migrate)
COPY package*.json ./
RUN npm ci

# App source
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001 && chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 8080

# Node-based health check (no curl needed on alpine)
HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["npm", "run", "start"]
