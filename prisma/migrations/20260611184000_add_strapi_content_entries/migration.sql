-- CreateEnum
CREATE TYPE "StrapiContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StrapiContentVisibility" AS ENUM ('INTERNAL', 'FUTURE_SITE_READ');

-- CreateTable
CREATE TABLE "strapi_content_entries" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sourceProvider" TEXT NOT NULL DEFAULT 'visboost',
    "sourceRequestId" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'blog_post',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "markdown" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "heroImage" JSONB,
    "metadata" JSONB,
    "visibility" "StrapiContentVisibility" NOT NULL DEFAULT 'INTERNAL',
    "status" "StrapiContentStatus" NOT NULL DEFAULT 'DRAFT',
    "externalEntryId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strapi_content_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strapi_content_entries_siteId_slug_key" ON "strapi_content_entries"("siteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "strapi_content_entries_siteId_sourceRequestId_key" ON "strapi_content_entries"("siteId", "sourceRequestId");

-- CreateIndex
CREATE INDEX "strapi_content_entries_siteId_status_idx" ON "strapi_content_entries"("siteId", "status");

-- CreateIndex
CREATE INDEX "strapi_content_entries_sourceProvider_idx" ON "strapi_content_entries"("sourceProvider");

-- AddForeignKey
ALTER TABLE "strapi_content_entries"
ADD CONSTRAINT "strapi_content_entries_siteId_fkey"
FOREIGN KEY ("siteId") REFERENCES "strapi_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
