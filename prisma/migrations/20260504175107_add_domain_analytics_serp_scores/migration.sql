-- AlterTable
ALTER TABLE "audit_results" ADD COLUMN     "domainAnalyticsScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serpScore" INTEGER NOT NULL DEFAULT 0;
