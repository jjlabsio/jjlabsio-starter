CREATE TYPE "EmailCampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT');
CREATE TYPE "EmailBatchStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

CREATE TABLE "email_campaigns" (
  "id" TEXT PRIMARY KEY,
  "subject" VARCHAR(200) NOT NULL,
  "previewText" VARCHAR(250) NOT NULL,
  "blocks" JSONB NOT NULL,
  "audiences" TEXT[] NOT NULL,
  "status" "EmailCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdBy" TEXT NOT NULL,
  "confirmedBy" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "from" TEXT,
  "html" TEXT,
  "text" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "email_campaigns_createdAt_idx" ON "email_campaigns"("createdAt");

CREATE TABLE "email_batches" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "position" INTEGER NOT NULL,
  "recipients" JSONB NOT NULL,
  "recipientCount" INTEGER NOT NULL,
  "status" "EmailBatchStatus" NOT NULL DEFAULT 'PENDING',
  "firstAttemptAt" TIMESTAMP(3),
  "leaseUntil" TIMESTAMP(3),
  "leaseToken" TEXT,
  "providerIds" TEXT[] NOT NULL,
  "acceptedAt" TIMESTAMP(3)
);
CREATE UNIQUE INDEX "email_batches_campaignId_position_key" ON "email_batches"("campaignId", "position");
CREATE INDEX "email_batches_campaignId_status_position_idx" ON "email_batches"("campaignId", "status", "position");
