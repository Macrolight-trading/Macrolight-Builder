-- Client delivery schedule: fulfillment checklist + calendar

CREATE TYPE "DeliveryTaskKind" AS ENUM ('ONE_TIME', 'RECURRING');
CREATE TYPE "DeliveryRecurrence" AS ENUM ('NONE', 'MONTHLY');

CREATE TABLE "client_delivery_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anchorAt" TIMESTAMP(3) NOT NULL,
    "basePlan" "Plan" NOT NULL DEFAULT 'NONE',
    "planRequestId" TEXT,
    "subscriptionId" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_delivery_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "delivery_tasks" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "kind" "DeliveryTaskKind" NOT NULL DEFAULT 'ONE_TIME',
    "billingType" "BillingType" NOT NULL DEFAULT 'ONE_TIME',
    "optionId" TEXT,
    "includedInBasePlan" BOOLEAN NOT NULL DEFAULT false,
    "dueAt" TIMESTAMP(3),
    "recurrence" "DeliveryRecurrence" NOT NULL DEFAULT 'NONE',
    "nextDueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastCompletedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "client_delivery_schedules_userId_key" ON "client_delivery_schedules"("userId");
CREATE INDEX "client_delivery_schedules_anchorAt_idx" ON "client_delivery_schedules"("anchorAt");

CREATE UNIQUE INDEX "delivery_tasks_scheduleId_sourceKey_key" ON "delivery_tasks"("scheduleId", "sourceKey");
CREATE INDEX "delivery_tasks_userId_active_dueAt_idx" ON "delivery_tasks"("userId", "active", "dueAt");
CREATE INDEX "delivery_tasks_userId_active_nextDueAt_idx" ON "delivery_tasks"("userId", "active", "nextDueAt");
CREATE INDEX "delivery_tasks_active_dueAt_idx" ON "delivery_tasks"("active", "dueAt");
CREATE INDEX "delivery_tasks_active_nextDueAt_idx" ON "delivery_tasks"("active", "nextDueAt");

ALTER TABLE "client_delivery_schedules" ADD CONSTRAINT "client_delivery_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "client_delivery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
