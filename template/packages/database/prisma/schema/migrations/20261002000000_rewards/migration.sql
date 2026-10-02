CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED');
CREATE TABLE "reward_submissions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "postUrl" VARCHAR(2048) NOT NULL,
  "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
  "consentVersion" TEXT NOT NULL,
  "participationAt" TIMESTAMP(3) NOT NULL,
  "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
  "marketingConsentAt" TIMESTAMP(3),
  "reviewNote" VARCHAR(1000) NOT NULL DEFAULT '',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reward_submissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "reward_submissions_userId_key" ON "reward_submissions"("userId");
CREATE UNIQUE INDEX "reward_submissions_postUrl_key" ON "reward_submissions"("postUrl");
CREATE INDEX "reward_submissions_status_createdAt_idx" ON "reward_submissions"("status", "createdAt");
ALTER TABLE "reward_submissions" ADD CONSTRAINT "reward_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "reward_review_events" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_review_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reward_review_events_submissionId_createdAt_idx" ON "reward_review_events"("submissionId", "createdAt");
ALTER TABLE "reward_review_events" ADD CONSTRAINT "reward_review_events_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "reward_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
