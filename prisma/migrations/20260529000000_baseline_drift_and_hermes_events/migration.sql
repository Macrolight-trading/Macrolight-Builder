-- Add Hermes Event Queue
-- Durable queue for app → Hermes agent notifications.

DO $$ BEGIN
    CREATE TYPE "HermesEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "hermes_events" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "userId" TEXT,
    "payload" JSONB NOT NULL,
    "status" "HermesEventStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hermes_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hermes_events_status_createdAt_idx" ON "hermes_events"("status", "createdAt");

ALTER TABLE "hermes_events" ADD CONSTRAINT "hermes_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
