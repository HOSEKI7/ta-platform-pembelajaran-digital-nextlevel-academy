/**
 * Bootstrap the FIRST administrator account from environment variables, so a
 * fresh deployment has a way in before any admin exists (the in-app UI only
 * onboards further admins via email invite). Idempotent — safe to run repeatedly.
 *
 * Reads:
 *   BOOTSTRAP_ADMIN_EMAIL     (required)
 *   BOOTSTRAP_ADMIN_NAME      (required)
 *   BOOTSTRAP_ADMIN_PASSWORD  (required, must meet PRD §6.1.1 complexity)
 *
 * Behaviour:
 *   - If a user with that email exists → ensures role=ADMINISTRATOR, isActive,
 *     and a working credential account (repairs the legacy "user row without an
 *     account credential" case that blocked login). Does NOT reset the password.
 *   - Otherwise → creates User (emailVerified, isActive, mustChangePassword=true)
 *     + credential Account in one transaction. The admin is forced to change the
 *     env-provided password at first login.
 *
 * Run with:  npx tsx scripts/bootstrap-admin.ts   (or: npm run bootstrap:admin)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function genId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(
      `\n✖ Missing required env var ${name}. Set BOOTSTRAP_ADMIN_EMAIL, ` +
        `BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ADMIN_PASSWORD in .env.local.\n`,
    );
    process.exit(1);
  }
  return value.trim();
}

async function main() {
  const email = readRequired("BOOTSTRAP_ADMIN_EMAIL").toLowerCase();
  const name = readRequired("BOOTSTRAP_ADMIN_NAME");
  const password = readRequired("BOOTSTRAP_ADMIN_PASSWORD");

  if (!PASSWORD_COMPLEXITY.test(password)) {
    console.error(
      "\n✖ BOOTSTRAP_ADMIN_PASSWORD must be ≥8 chars with an upper-case, a " +
        "lower-case letter and a digit.\n",
    );
    process.exit(1);
  }

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, isActive: true },
  });

  if (existing) {
    // Repair / promote an existing account without touching its password.
    const account = await db.account.findFirst({
      where: { userId: existing.id, providerId: "credential" },
      select: { id: true, password: true },
    });

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.id },
        data: { role: "ADMINISTRATOR", isActive: true, deletedAt: null },
      });

      if (!account || !account.password) {
        // Legacy/seed user with no usable credential → set it from the env
        // password and force a change on first login.
        const passwordHash = await hashPassword(password);
        if (account) {
          await tx.account.update({
            where: { id: account.id },
            data: { password: passwordHash },
          });
        } else {
          await tx.account.create({
            data: {
              id: genId("acc"),
              userId: existing.id,
              accountId: existing.id,
              providerId: "credential",
              password: passwordHash,
            },
          });
        }
        await tx.user.update({
          where: { id: existing.id },
          data: { mustChangePassword: true },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: existing.id,
          action: "BOOTSTRAP_ADMIN",
          entityType: "User",
          entityId: existing.id,
          metadata: { email, mode: "ensured", repairedCredential: !account?.password },
        },
      });
    });

    console.log(
      `\n✔ Admin ensured for ${email} (existing account promoted/repaired).` +
        `${!account?.password ? " Credential set — change password at first login." : ""}\n`,
    );
    return;
  }

  // Fresh creation.
  const userId = genId("user");
  const now = new Date();
  const passwordHash = await hashPassword(password);

  await db.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id: userId,
        email,
        name,
        role: "ADMINISTRATOR",
        emailVerified: true,
        isActive: true,
        mustChangePassword: true, // force change of the env-provided password
        createdAt: now,
        updatedAt: now,
      },
    });
    await tx.account.create({
      data: {
        id: genId("acc"),
        userId,
        accountId: userId,
        providerId: "credential",
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "BOOTSTRAP_ADMIN",
        entityType: "User",
        entityId: userId,
        metadata: { email, mode: "created" },
      },
    });
  });

  console.log(
    `\n✔ First administrator created: ${email}\n` +
      `  Log in with the env password, then you'll be forced to change it.\n`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
