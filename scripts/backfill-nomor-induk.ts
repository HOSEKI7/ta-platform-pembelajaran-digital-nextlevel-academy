/**
 * One-shot script to backfill kode_batch, kode_bidang, and nomor_induk
 * on existing data.
 *
 * Dry-run: add `--dry-run` flag to see what would be done without writing.
 *
 * Usage: npx tsx scripts/backfill-nomor-induk.ts [--dry-run]
 *
 * NOTE: This script must be run BEFORE the NOT NULL + unique constraints are
 * applied via `prisma db push` / `prisma migrate`. The schema already declares
 * these fields as `String`, but the DB may still have NULLs at this point, so
 * the script uses raw SQL to bypass the type system.
 *
 * Column names use Prisma's camelCase (no @map on individual fields, so
 * e.g. "batchId" not "batch_id", "createdAt" not "created_at").
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: ["error"] });
const isDryRun = process.argv.includes("--dry-run");
const kodeBidangArgs = process.argv
  .filter((a) => /^\d{3}$/.test(a))
  .slice(0, 100);

function log(msg: string) {
  console.log(isDryRun ? `[DRY-RUN] ${msg}` : msg);
}

async function main() {
  // === Step 1: Backfill kode_batch ===
  type BatchRow = { id: string; name: string };
  const batchRows: BatchRow[] = await prisma.$queryRawUnsafe(
    `SELECT id, name FROM "batch" WHERE kode_batch IS NULL ORDER BY "createdAt"`,
  );

  if (batchRows.length === 0) {
    log("All batches already have kode_batch.");
  } else {
    const [maxRow] = await prisma.$queryRawUnsafe<
      { kode_batch: string }[]
    >(
      `SELECT kode_batch FROM "batch" WHERE kode_batch IS NOT NULL ORDER BY kode_batch DESC LIMIT 1`,
    );
    let nextCode = maxRow?.kode_batch
      ? parseInt(maxRow.kode_batch, 10) + 1
      : 1;

    for (const batch of batchRows) {
      const code = String(nextCode).padStart(2, "0");
      log(`Batch "${batch.name}" → kode_batch = ${code}`);
      if (!isDryRun) {
        await prisma.$executeRawUnsafe(
          `UPDATE "batch" SET kode_batch = $1 WHERE id = $2`,
          code,
          batch.id,
        );
      }
      nextCode++;
    }
  }

  // === Step 2: Backfill kode_bidang (MANUAL INPUT) ===
  type FieldRow = { id: string; name: string; batch_name: string };
  const fieldRows: FieldRow[] = await prisma.$queryRawUnsafe(
    `SELECT f.id, f.name, b.name AS batch_name FROM "field" f JOIN "batch" b ON b.id = f."batchId" WHERE f.kode_bidang IS NULL ORDER BY b.name, f.name`,
  );

  if (fieldRows.length === 0) {
    log("All fields already have kode_bidang.");
  } else if (isDryRun) {
    log(`Fields needing kode_bidang (${fieldRows.length}):`);
    for (const field of fieldRows) {
      log(`  [${field.batch_name}] "${field.name}" → kode_bidang = ???`);
    }
    log("(Run without --dry-run to assign codes interactively)");
  } else {
    if (kodeBidangArgs.length < fieldRows.length) {
      console.error(
        `ERROR: ${fieldRows.length} fields need kode_bidang, but only ${kodeBidangArgs.length} codes provided.\n` +
          `Pass 3-digit codes as arguments: npx tsx scripts/backfill-nomor-induk.ts 121 111 112`,
      );
      process.exit(1);
    }

    for (let i = 0; i < fieldRows.length; i++) {
      const field = fieldRows[i];
      const code = kodeBidangArgs[i];

      log(`Field "${field.name}" (${field.batch_name}) → kode_bidang = ${code}`);
      if (!isDryRun) {
        await prisma.$executeRawUnsafe(
          `UPDATE "field" SET kode_bidang = $1 WHERE id = $2`,
          code,
          field.id,
        );
      }
    }
  }

  // === Step 3: Backfill nomor_induk ===
  type ProfileRow = {
    id: string;
    user_id: string;
    batch_id: string;
    batch_kode: string | null;
    bidang_kode: string | null;
  };
  const profileRows: ProfileRow[] = await prisma.$queryRawUnsafe(
    `SELECT ip.id, ip."userId" AS user_id, b.id AS batch_id, b.kode_batch AS batch_kode, f.kode_bidang AS bidang_kode
     FROM "internship_profile" ip
     JOIN "class" c ON c.id = ip."classId"
     JOIN "field" f ON f.id = c."fieldId"
     JOIN "batch" b ON b.id = f."batchId"
     WHERE ip.nomor_induk IS NULL
     ORDER BY b.name, f.name, ip."userId"`,
  );

  if (profileRows.length === 0) {
    log("All profiles already have nomor_induk.");
  } else {
    const batchCounts = new Map<string, number>();

    for (const profile of profileRows) {
      const batchId = profile.batch_id;
      if (!batchCounts.has(batchId)) {
        const [countResult] = await prisma.$queryRawUnsafe<
          { cnt: number }[]
        >(
          `SELECT COUNT(*)::int AS cnt FROM "internship_profile" ip
           JOIN "class" c ON c.id = ip."classId"
           JOIN "field" f ON f.id = c."fieldId"
           WHERE f."batchId" = $1 AND ip.nomor_induk IS NOT NULL`,
          batchId,
        );
        batchCounts.set(batchId, countResult?.cnt ?? 0);
      }

      if (!profile.batch_kode || !profile.bidang_kode) {
        log(`  SKIP: Batch/Bidang code missing for userId=${profile.user_id}`);
        continue;
      }

      const count = batchCounts.get(batchId)! + 1;
      batchCounts.set(batchId, count);

      const seq = String(count).padStart(4, "0");
      const nomorInduk = `${profile.batch_kode}${profile.bidang_kode}${seq}`;

      log(`  userId=${profile.user_id} → nomor_induk = ${nomorInduk}`);

      if (!isDryRun) {
        await prisma.$executeRawUnsafe(
          `UPDATE "internship_profile" SET nomor_induk = $1 WHERE id = $2`,
          nomorInduk,
          profile.id,
        );
      }
    }
  }

  console.log(isDryRun ? "\nDry-run complete. No changes made." : "\nBackfill complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
