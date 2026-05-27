/**
 * Seed a PESERTA_MAGANG test account for UI/feature testing.
 *
 * Run with:  npx tsx scripts/seed-internship-user.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomBytes, scrypt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

// ---- Same scrypt params as @better-auth/utils/password.node ----------------
const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(
      password.normalize("NFKC"),
      salt,
      SCRYPT_CONFIG.dkLen,
      {
        N: SCRYPT_CONFIG.N,
        r: SCRYPT_CONFIG.r,
        p: SCRYPT_CONFIG.p,
        maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
      },
      (err, key) => {
        if (err) reject(err);
        else resolve(`${salt}:${key.toString("hex")}`);
      },
    );
  });
}

// ---- User data --------------------------------------------------------------
const USER_EMAIL = "farzanzr170404@gmail.com";
const USER_NAME = "Aqsha Naya Ruzqa";
const USER_USERNAME = "Naya";
const PLAIN_PASSWORD = "NayaTest123";

async function main() {
  // Check if user already exists
  const existing = await db.user.findFirst({
    where: { OR: [{ email: USER_EMAIL }, { username: USER_USERNAME }] },
    select: { id: true, email: true, username: true },
  });
  if (existing) {
    console.log(
      `⚠  User already exists (email=${existing.email}, username=${existing.username}). Skipping.`,
    );
    return;
  }

  const passwordHash = await hashPassword(PLAIN_PASSWORD);
  const userId = `user_${randomBytes(12).toString("hex")}`;
  const accountId = `acc_${randomBytes(12).toString("hex")}`;
  const now = new Date();

  await db.$transaction([
    db.user.create({
      data: {
        id: userId,
        email: USER_EMAIL,
        name: USER_NAME,
        username: USER_USERNAME,
        emailVerified: true, // skip verification for test account
        role: "PESERTA_MAGANG",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    }),
    db.account.create({
      data: {
        id: accountId,
        userId: userId,
        accountId: userId, // Better Auth convention: accountId = userId for email/password
        providerId: "credential",
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  console.log("✓ PESERTA_MAGANG test account created successfully:");
  console.log(`  Email    : ${USER_EMAIL}`);
  console.log(`  Username : ${USER_USERNAME}`);
  console.log(`  Name     : ${USER_NAME}`);
  console.log(`  Password : ${PLAIN_PASSWORD}`);
  console.log(`  Role     : PESERTA_MAGANG`);
  console.log(`  User ID  : ${userId}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
