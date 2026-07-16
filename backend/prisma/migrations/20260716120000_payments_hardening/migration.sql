-- Payments hardening: idempotency + webhook dedup

-- Donation: idempotency key for create-order, unique payment id (a payment settles ≤ 1 donation)
ALTER TABLE "Donation" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Donation_idempotencyKey_key" ON "Donation"("idempotencyKey");
CREATE UNIQUE INDEX "Donation_gatewayPaymentId_key" ON "Donation"("gatewayPaymentId");

-- WebhookEvent: one row per provider webhook delivery (dedup + audit)
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");
CREATE INDEX "WebhookEvent_status_createdAt_idx" ON "WebhookEvent"("status", "createdAt");
