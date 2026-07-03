-- Migration: make maxUsagePerUser nullable
-- Prisma diff: Int @default(1) → Int?

ALTER TABLE "voucher" ALTER COLUMN "maxUsagePerUser" DROP NOT NULL;
ALTER TABLE "voucher" ALTER COLUMN "maxUsagePerUser" DROP DEFAULT;

-- Backfill: admin-created vouchers get NULL (unlimited per user, opt-in via toggle)
-- System-generated reward vouchers stay 1 (unchanged)
UPDATE "voucher" SET "maxUsagePerUser" = NULL WHERE "isSystemGenerated" = false;
