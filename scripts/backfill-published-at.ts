/**
 * One-shot backfill for Course.publishedAt (added with the admin Course
 * Management table). Until the publish/edit flow stamps the field on its own,
 * existing PUBLISHED courses have no publish date — this sets it to createdAt
 * so the "Tanggal Dipublish" column isn't empty for already-live courses.
 *
 * Idempotent: only touches PUBLISHED rows where publishedAt IS NULL.
 *
 * Run with:  npx tsx scripts/backfill-published-at.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  const targets = await db.course.findMany({
    where: { status: "PUBLISHED", publishedAt: null },
    select: { id: true, createdAt: true },
  });

  if (targets.length === 0) {
    console.log("Nothing to backfill — all PUBLISHED courses already have publishedAt.");
    return;
  }

  await db.$transaction(
    targets.map((c) =>
      db.course.update({
        where: { id: c.id },
        data: { publishedAt: c.createdAt },
      }),
    ),
  );

  console.log(`Backfilled publishedAt for ${targets.length} PUBLISHED course(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
