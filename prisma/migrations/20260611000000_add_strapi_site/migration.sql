-- CreateEnum
CREATE TYPE "StrapiSiteStatus" AS ENUM ('UNLINKED', 'PENDING', 'ACTIVE', 'ERROR', 'DISABLED');

-- CreateTable
CREATE TABLE "strapi_sites" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "strapiBaseUrl" TEXT,
    "strapiSpaceId" TEXT,
    "strapiCollection" TEXT,
    "status" "StrapiSiteStatus" NOT NULL DEFAULT 'PENDING',
    "pairingKeyHash" TEXT,
    "pairingKeyPrefix" TEXT,
    "pairingKeyLast4" TEXT,
    "pairingKeyRotatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "lastPairedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strapi_sites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strapi_sites_slug_key" ON "strapi_sites"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "strapi_sites_pairingKeyPrefix_key" ON "strapi_sites"("pairingKeyPrefix");

-- CreateIndex
CREATE INDEX "strapi_sites_userId_idx" ON "strapi_sites"("userId");

-- CreateIndex
CREATE INDEX "strapi_sites_projectId_idx" ON "strapi_sites"("projectId");

-- CreateIndex
CREATE INDEX "strapi_sites_status_idx" ON "strapi_sites"("status");
