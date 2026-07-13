/**
 * Permanently delete a PESERTA_DIDIK (student) user and ALL associated data
 * (enrollments, orders, certificates, game profile, notifications, etc.) so
 * the email address can be reused to register a fresh account.
 *
 * Run with:  npx tsx scripts/delete-student.ts <email> [--yes]
 *
 * Flags:
 *   --yes, -y    Skip the confirmation prompt and delete immediately.
 *
 * Safety:
 *   - Refuses to delete any user whose role is NOT PESERTA_DIDIK.
 *   - Dry-run mode by default — shows a summary and asks for confirmation.
 *   - Every change is wrapped in a single $transaction for atomicity.
 *   - Only touches data belonging to the specified user.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

import { createInterface } from "node:readline";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

function printUsage(): void {
  console.log(`
Usage: npx tsx scripts/delete-student.ts <email> [--yes]

Arguments:
  email     Email address of the PESERTA_DIDIK user to delete.

Flags:
  --yes, -y  Skip confirmation prompt and delete immediately.

Examples:
  npx tsx scripts/delete-student.ts user@example.com
  npx tsx scripts/delete-student.ts user@example.com --yes
`);
}

async function askYesNo(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${prompt} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes");
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const emailRaw = args.find((a) => !a.startsWith("-"));
  const skipPrompt = args.includes("--yes") || args.includes("-y");

  if (!emailRaw) {
    printUsage();
    process.exit(1);
  }

  const email = emailRaw.toLowerCase().trim();

  // --- 1. Look up the user ---
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          orders: true,
          certificates: true,
          expLogs: true,
          badges: true,
          notifications: true,
          attendances: true,
          taskSubmissions: true,
          auditLogs: true,
        },
      },
    },
  });

  if (!user) {
    console.error(`\n✖ User not found for email: ${email}\n`);
    process.exit(1);
  }

  if (user.role !== "PESERTA_DIDIK") {
    console.error(
      `\n✖ User "${email}" has role "${user.role}". This script only deletes PESERTA_DIDIK.\n`,
    );
    process.exit(1);
  }

  // Gather additional counts for relations with no cascade
  const [voucherUsageCount, paymentWebhookCount, auditLogCount, slugHistoryCount, settingCount, voucherAllowedCount] =
    await Promise.all([
      db.voucherUsage.count({ where: { userId: user.id } }),
      db.paymentWebhookEvent.count({ where: { order: { userId: user.id } } }),
      db.auditLog.count({ where: { actorId: user.id } }),
      db.courseSlugHistory.count({ where: { changedById: user.id } }),
      db.platformSetting.count({ where: { updatedBy: user.id } }),
      db.voucher.count({ where: { allowedUserId: user.id } }),
    ]);

  const { _count } = user;

  // --- 2. Summary ---
  const separator = "─".repeat(50);
  console.log(`\n${separator}`);
  console.log("  DELETE STUDENT — SUMMARY");
  console.log(`${separator}`);
  console.log(`  Name                : ${user.name}`);
  console.log(`  Email               : ${user.email}`);
  console.log(`  Registered          : ${user.createdAt.toISOString().split("T")[0]}`);
  console.log(`${separator}`);
  console.log("  Data to be DELETED:");
  console.log(`    Enrollments        : ${_count.enrollments}`);
  console.log(`    Orders             : ${_count.orders}`);
  console.log(`    Certificates       : ${_count.certificates}`);
  console.log(`    EXP logs           : ${_count.expLogs}`);
  console.log(`    Badges             : ${_count.badges}`);
  console.log(`    Notifications      : ${_count.notifications}`);
  console.log(`    Payment webhooks   : ${paymentWebhookCount}`);
  console.log(`    Voucher usages     : ${voucherUsageCount}`);
  console.log(`    Attendances        : ${_count.attendances}`);
  console.log(`    Task submissions   : ${_count.taskSubmissions}`);
  console.log(`${separator}`);
  console.log("  References to be NULLED:");
  console.log(`    Audit logs (actor) : ${auditLogCount}`);
  console.log(`    Slug history       : ${slugHistoryCount}`);
  console.log(`    Platform settings  : ${settingCount}`);
  console.log(`    Voucher allowed    : ${voucherAllowedCount}`);
  console.log(`${separator}`);
  console.log("  Effect: Re-registration with this email will create a brand-new, clean account.");
  console.log(`${separator}\n`);

  // --- 3. Confirm ---
  if (!skipPrompt) {
    const ok = await askYesNo("  Are you sure you want to permanently delete this student?");
    if (!ok) {
      console.log("  Cancelled.\n");
      process.exit(0);
    }
  }

  // --- 4. Delete in a single transaction ---
  await db.$transaction(async (tx) => {
    // 4a. Nullify non-cascade, nullable FKs first
    await tx.auditLog.updateMany({
      where: { actorId: user.id },
      data: { actorId: null },
    });
    await tx.courseSlugHistory.updateMany({
      where: { changedById: user.id },
      data: { changedById: null },
    });
    await tx.platformSetting.updateMany({
      where: { updatedBy: user.id },
      data: { updatedBy: null },
    });
    await tx.voucher.updateMany({
      where: { allowedUserId: user.id },
      data: { allowedUserId: null },
    });

    // 4b. Delete PaymentWebhookEvent (FK to Order — no direct userId, go through order)
    await tx.paymentWebhookEvent.deleteMany({
      where: { order: { userId: user.id } },
    });

    // 4c. Delete VoucherUsage (FK to User + Order)
    await tx.voucherUsage.deleteMany({
      where: { userId: user.id },
    });

    // 4d. Delete Certificate (FK to User + Enrollment — must go before User)
    await tx.certificate.deleteMany({
      where: { userId: user.id },
    });

    // 4e. Delete Order (FK to User + Course)
    await tx.order.deleteMany({
      where: { userId: user.id },
    });

    // 4f. Delete User — cascades:
    //   Session, Account, Enrollment → StepProgress / StepNote,
    //   UserGameProfile, UserBadge, ExpLog, Notification,
    //   Attendance, TaskSubmission, FinalGrade
    await tx.user.delete({
      where: { id: user.id },
    });
  });

  console.log(`\n✔ Student "${email}" permanently deleted.\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
