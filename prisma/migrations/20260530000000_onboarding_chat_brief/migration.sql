-- Onboarding chat agent: contact fields, brief blob URL, chat transcript

ALTER TABLE "onboarding_data" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "onboarding_data" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "onboarding_data" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "onboarding_data" ADD COLUMN IF NOT EXISTS "briefMarkdownUrl" TEXT;
ALTER TABLE "onboarding_data" ADD COLUMN IF NOT EXISTS "chatMessages" JSONB;
