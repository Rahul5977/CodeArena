-- CreateEnum
CREATE TYPE "SubmissionJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "SubmissionJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "contestId" TEXT,
    "sourceCode" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "SubmissionJobStatus" NOT NULL DEFAULT 'QUEUED',
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubmissionJob_status_createdAt_idx" ON "SubmissionJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SubmissionJob_userId_status_idx" ON "SubmissionJob"("userId", "status");

-- CreateIndex
CREATE INDEX "SubmissionJob_userId_contestId_problemId_createdAt_idx" ON "SubmissionJob"("userId", "contestId", "problemId", "createdAt");

-- AddForeignKey
ALTER TABLE "SubmissionJob" ADD CONSTRAINT "SubmissionJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionJob" ADD CONSTRAINT "SubmissionJob_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionJob" ADD CONSTRAINT "SubmissionJob_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
