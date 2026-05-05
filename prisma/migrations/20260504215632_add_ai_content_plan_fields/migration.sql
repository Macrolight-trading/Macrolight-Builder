-- AlterTable
ALTER TABLE "audit_results" ADD COLUMN     "aiContentPlan" JSONB,
ADD COLUMN     "aiContentPlanAt" TIMESTAMP(3);
