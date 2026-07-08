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
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: ["error"] });
const isDryRun = process.argv.includes("--dry-run");

function log(msg: string) {
  console.log(isDryRun ? `[DRY-RUN] ${msg}` : msg);
}

/**
 * Raw wrapper: find rows where the column IS NULL, bypassing the NOT NULL
 * type constraint that Prisma's generated client enforces.
 */
async function queryNullable<T>(
  table: string,
  column: string,
  orderBy: string,
): Promise<{ id: string; name: string; batchName?: string }[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, name FROM "${table}" WHERE "${column}" IS NULL ORDER BY "${orderBy}"`,
  );
  return rows;
}

async function updateField(
  table: string,
  id: string,
  column: string,
  value: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$executeRawUnsafe(
    `UPDATE "${table}" SET "${column}" = $1 WHERE id = $2`,
    value,
    id,
  );
}

async function main() {
  // === Step 1: Backfill kode_batch ===
  const batchRows = await queryNullable("batch", "kode_batch", "created_at");

  if (batchRows.length === 0) {
    log("All batches already have kode_batch.");
  } else {
    const [maxRow] = await prisma.$queryRawUnsafe<{ kode_batch: string }[]>(
      `SELECT kode_batch FROM "batch" WHERE kode_batch IS NOT NULL ORDER BY kode_batch DESC LIMIT 1`,
    );
    let nextCode = maxRow?.kode_batch
      ? parseInt(maxRow.kode_batch, 10) + 1
      : 1;

    for (const batch of batchRows) {
      const code = String(nextCode).padStart(2, "0");
      log(`Batch "${batch.name}" → kode_batch = ${code}`);
      if (!isDryRun) {
        await updateField("batch", batch.id, "kode_batch", code);
      }
      nextCode++;
    }
  }

  // === Step 2: Backfill kode_bidang (MANUAL INPUT) ===
  const fieldRows = await prisma.$queryRawUnsafe<
    { id: string; name: string; batch_name: string }[]
  >(
    `SELECT f.id, f.name, b.name as batch_name FROM "field" f JOIN "batch" b ON b.id = f.batch_id WHERE f.kode_bidang IS NULL ORDER BY b.name, f.name`,
  );

  if (fieldRows.length === 0) {
    log("All fields already have kode_bidang.");
  } else {
    const rl = createInterface({ input: stdin, output: stdout });

    for (const field of fieldRows) {
      const [existing] = await prisma.$queryRawUnsafe<
        { kode_bidang: string }[]
      >(
        `SELECT kode_bidang FROM "field" WHERE kode_bidang IS NOT NULL`,
      );
      const usedCodes = new Set(
        existing ? [existing.kode_bidang] : [],
      );

      let code: string | null = null;
      while (!code) {
        const answer = await rl.question(
          `[${field.batch_name}] "${field.name}" — Enter 3-digit kode_bidang: `,
        );
        const trimmed = answer.trim();
        if (!/^\d{3}$/.test(trimmed)) {
          console.log("  Invalid. Must be exactly 3 digits (e.g. 111). Try again.");
          continue;
        }
        if (usedCodes.has(trimmed)) {
          console.log(`  Code ${trimmed} already in use. Try again.`);
          continue;
        }
        code = trimmed;
      }

      log(`Field "${field.name}" → kode_bidang = ${code}`);
      if (!isDryRun) {
        await updateField("field", field.id, "kode_bidang", code);
      }
    }

    rl.close();
  }

  // === Step 3: Backfill nomor_induk ===
  const profileRows = await prisma.$queryRawUnsafe<
    {
      id: string;
      user_id: string;
      batch_id: string;
      batch_kode: string | null;
      bidang_kode: string | null;
    }[]
  >(
    `SELECT ip.id, ip.user_id, b.id as batch_id, b.kode_batch as batch_kode, f.kode_bidang as bidang_kode
     FROM internship_profile ip
     JOIN "class" c ON c.id = ip.class_id
     JOIN "field" f ON f.id = c.field_id
     JOIN "batch" b ON b.id = f.batch_id
     WHERE ip.nomor_induk IS NULL
     ORDER BY b.name, f.name, ip.user_id`,
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
          `SELECT COUNT(*)::int as cnt FROM internship_profile ip
           JOIN "class" c ON c.id = ip.class_id
           JOIN "field" f ON f.id = c.field_id
           WHERE f.batch_id = $1 AND ip.nomor_induk IS NOT NULL`,
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
        await updateField("internship_profile", profile.id, "nomor_induk", nomorInduk);
      }
    }
  }

  console.log(isDryRun ? "\nDry-run complete. No changes made." : "\nBackfill complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
