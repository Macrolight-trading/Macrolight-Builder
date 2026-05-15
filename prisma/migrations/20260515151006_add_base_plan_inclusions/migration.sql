-- AlterTable
ALTER TABLE "custom_plan_request_items" ADD COLUMN     "includedInBasePlan" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "plan_categories" ADD COLUMN     "includedFromTier" "Plan";
