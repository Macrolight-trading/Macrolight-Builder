-- CreateTable
CREATE TABLE "plan_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "basePlan" "Plan" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_recommendation_items" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "plan_recommendation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_recommendations_userId_key" ON "plan_recommendations"("userId");

-- CreateIndex
CREATE INDEX "plan_recommendation_items_recommendationId_idx" ON "plan_recommendation_items"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_recommendation_items_recommendationId_optionId_key" ON "plan_recommendation_items"("recommendationId", "optionId");

-- AddForeignKey
ALTER TABLE "plan_recommendations" ADD CONSTRAINT "plan_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_recommendation_items" ADD CONSTRAINT "plan_recommendation_items_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "plan_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_recommendation_items" ADD CONSTRAINT "plan_recommendation_items_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "plan_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
