/**
 * One-off, idempotent backfill for the certificate refactor (PRD §6.6).
 *
 * Run ONCE right after `prisma db push` adds `claimedAt` + `imageUrl`, and
 * BEFORE users complete new courses on the new build:
 *
 *   npx tsx scripts/backfill-certificates.ts
 *
 * What it does:
 *   1. Stamps every existing certificate (`claimedAt = issuedAt`). Under the old
 *      flow a certificate only existed because the user clicked "Klaim", so all
 *      pre-existing rows are considered already-claimed.
 *   2. Auto-issues a certificate (`claimedAt = null`) for every enrollment that
 *      reached 100% but was never claimed — these surface in "Belum Diklaim".
 *
 * Images are intentionally NOT generated here; the public page / PDF route
 * lazy-renders them on first read. Re-running is safe for step 2 (skips
 * existing) but step 1 will also stamp any genuinely-unclaimed new rows — hence
 * "run once".
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

const CERT_NO_PREFIX = "NLA-";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ID_LENGTH = 12;

function generateCertificateNo(): string {
  const bytes = randomBytes(ID_LENGTH);
  let out = "";
  for (let i = 0; i < ID_LENGTH; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${CERT_NO_PREFIX}${out}`;
}

async function computeExpiry(issuedAt: Date): Promise<Date | null> {
  const setting = await db.platformSetting.findUnique({
    where: { key: "CERTIFICATE_EXPIRY_YEARS" },
    select: { value: true },
  });
  const raw = setting?.value?.trim() ?? "";
  if (raw.length === 0) return null;
  const years = Number(raw);
  if (!Number.isFinite(years) || years <= 0) return null;
  const d = new Date(issuedAt);
  d.setUTCFullYear(d.getUTCFullYear() + Math.floor(years));
  return d;
}

async function main() {
  // Step 1 — mark existing certificates as claimed. Prisma can't set a column
  // to another column's value in updateMany, so copy issuedAt → claimedAt in
  // raw SQL for rows still null.
  const stampedRows: number = await db.$executeRaw`
    UPDATE "certificate" SET "claimedAt" = "issuedAt" WHERE "claimedAt" IS NULL
  `;
  console.log(`Stamped existing certificates as claimed: ${stampedRows}`);

  // Step 1b — snapshot the recipient name for legacy rows. recipientName is the
  // immutable name source; copy each certificate's current account name into it
  // so renaming the account later no longer alters issued certificates.
  const namedRows: number = await db.$executeRaw`
    UPDATE "certificate" c SET "recipientName" = u."name"
    FROM "user" u WHERE c."userId" = u."id" AND c."recipientName" IS NULL
  `;
  console.log(`Snapshotted recipientName for legacy certificates: ${namedRows}`);

  // Step 2 — issue certificates for completed-but-uncertified enrollments.
  const pending = await db.enrollment.findMany({
    where: { progressPct: { gte: 100 }, certificate: null },
    select: {
      id: true,
      userId: true,
      courseId: true,
      completedAt: true,
      user: { select: { name: true } },
    },
  });
  console.log(`Enrollments needing a certificate: ${pending.length}`);

  let created = 0;
  for (const e of pending) {
    const issuedAt = e.completedAt ?? new Date();
    const expiresAt = await computeExpiry(issuedAt);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await db.certificate.create({
          data: {
            userId: e.userId,
            courseId: e.courseId,
            enrollmentId: e.id,
            certificateNo: generateCertificateNo(),
            recipientName: e.user.name,
            issuedAt,
            expiresAt,
            claimedAt: null,
          },
        });
        created += 1;
        break;
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "P2002") continue; // cert-no or enrollment race — retry/skip
        throw err;
      }
    }
  }
  console.log(`Issued new (unclaimed) certificates: ${created}`);
  console.log("Done. Images will lazy-render on first view.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
