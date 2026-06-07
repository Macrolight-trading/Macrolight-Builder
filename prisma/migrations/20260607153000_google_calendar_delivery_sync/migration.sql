-- Add Google Calendar sync metadata to delivery tasks

ALTER TABLE "delivery_tasks"
  ADD COLUMN "googleCalendarEventId" TEXT,
  ADD COLUMN "googleCalendarHtmlLink" TEXT,
  ADD COLUMN "googleCalendarSyncedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "delivery_tasks_googleCalendarEventId_key"
  ON "delivery_tasks"("googleCalendarEventId");
