-- CreateTable
CREATE TABLE "visboost_handoffs" (
    "id" TEXT NOT NULL,
    "handoffId" TEXT NOT NULL,
    "auditId" TEXT,
    "clientId" TEXT NOT NULL,
    "serviceType" TEXT,
    "overallScore" INTEGER,
    "leadId" TEXT,
    "noteId" TEXT,
    "activityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visboost_handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visboost_handoffs_handoffId_key" ON "visboost_handoffs"("handoffId");

-- CreateIndex
CREATE INDEX "visboost_handoffs_clientId_idx" ON "visboost_handoffs"("clientId");
