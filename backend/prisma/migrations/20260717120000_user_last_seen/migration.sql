-- Live-now presence: heartbeat timestamp + indexes for the admin presence/recent lists
ALTER TABLE "User" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");
