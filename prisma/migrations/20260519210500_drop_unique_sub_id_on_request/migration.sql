-- DropIndex
DROP INDEX "custom_plan_requests_stripeSubscriptionId_key";

-- CreateIndex
CREATE INDEX "custom_plan_requests_stripeSubscriptionId_idx" ON "custom_plan_requests"("stripeSubscriptionId");
