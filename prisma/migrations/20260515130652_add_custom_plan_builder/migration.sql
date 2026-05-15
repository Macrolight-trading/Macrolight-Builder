-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('ONE_TIME', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PlanRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateTable
CREATE TABLE "plan_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "billingType" "BillingType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_plan_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "basePlan" "Plan" NOT NULL DEFAULT 'STARTER',
    "status" "PlanRequestStatus" NOT NULL DEFAULT 'PENDING',
    "monthlyCents" INTEGER NOT NULL DEFAULT 0,
    "oneTimeCents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_plan_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_plan_request_items" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "optionId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "billingType" "BillingType" NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "custom_plan_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_options_active_category_sortOrder_idx" ON "plan_options"("active", "category", "sortOrder");

-- CreateIndex
CREATE INDEX "custom_plan_requests_userId_idx" ON "custom_plan_requests"("userId");

-- CreateIndex
CREATE INDEX "custom_plan_requests_status_createdAt_idx" ON "custom_plan_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "custom_plan_request_items_requestId_idx" ON "custom_plan_request_items"("requestId");

-- AddForeignKey
ALTER TABLE "custom_plan_requests" ADD CONSTRAINT "custom_plan_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_plan_request_items" ADD CONSTRAINT "custom_plan_request_items_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "custom_plan_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_plan_request_items" ADD CONSTRAINT "custom_plan_request_items_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "plan_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
