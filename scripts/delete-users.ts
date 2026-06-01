/**
 * Hard-delete one or more user accounts (test/dummy cleanup) by email.
 *
 * Why this script exists:
 *   Several FKs to the `user` table are intentionally NOT `ON DELETE CASCADE`
 *   (default `Restrict`) so financial/audit rows survive a user delete — that's
 *   why the admin panel uses soft delete (`User.deletedAt`). Deleting a user from
 *   the Supabase Table Editor therefore fails with FK errors (order_userId_fkey,
 *   task_mentorId_fkey, ...). This script removes the blocking rows in the correct
 *   order inside a single transaction, then deletes the user (the remaining
 *   relations cascade automatically).
 *
 * SAFETY: dry-run by default. Pass `--commit` to actually delete.
 *
 * Usage:
 *   npx tsx scripts/delete-users.ts a@x.com b@y.com            # preview only
 *   npx tsx scripts/delete-users.ts a@x.com --commit           # execute
 *   npx tsx scripts/delete-users.ts admin@x.com --commit --force  # allow ADMINISTRATOR
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  const args = process.argv.slice(2);
  const commit = args.includes("--commit");
  const force = args.includes("--force");
  const emails = args.filter((a) => !a.startsWith("--"));

  if (emails.length === 0) {
    console.log(
      [
        "Usage: npx tsx scripts/delete-users.ts <email...> [--commit] [--force]",
        "",
        "  (no flag)  preview only — shows what would be deleted, writes nothing",
        "  --commit   actually delete the accounts + dependents in one transaction",
        "  --force    include ADMINISTRATOR accounts (skipped by default)",
      ].join("\n"),
    );
    return;
  }

  const found = await db.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, name: true, email: true, role: true },
  });

  const missing = emails.filter((e) => !found.some((u) => u.email === e));
  for (const e of missing) console.warn(`⚠️  Not found, skipping: ${e}`);

  const targets = found.filter((u) => {
    if (u.role === Role.ADMINISTRATOR && !force) {
      console.warn(
        `⚠️  Skipping ADMINISTRATOR ${u.email} (pass --force to include)`,
      );
      return false;
    }
    return true;
  });

  if (targets.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const ids = targets.map((u) => u.id);

  // Count blocking + notable cascading dependents for the preview.
  const [voucherUsages, certificates, orders, tasks, finalGradesAsMentor] =
    await Promise.all([
      db.voucherUsage.count({ where: { userId: { in: ids } } }),
      db.certificate.count({ where: { userId: { in: ids } } }),
      db.order.count({ where: { userId: { in: ids } } }),
      db.task.count({ where: { mentorId: { in: ids } } }),
      db.finalGrade.count({ where: { mentorId: { in: ids } } }),
    ]);

  console.log("\n== Akun yang akan dihapus ==");
  for (const u of targets) {
    console.log(`  • ${u.name} <${u.email}> [${u.role}] (${u.id})`);
  }
  console.log("\n== Dependen pemblokir yang dihapus lebih dulu ==");
  console.log(`  voucher_usage : ${voucherUsages}`);
  console.log(`  certificate   : ${certificates}`);
  console.log(`  order         : ${orders}`);
  console.log(`  task          : ${tasks}  (cascade → task_submission)`);
  console.log(`  final_grade   : ${finalGradesAsMentor}  (sebagai mentor)`);
  console.log(
    "  + session/account/profil/enrollment/attendance/notification/badge/exp → cascade otomatis",
  );

  if (!commit) {
    console.log(
      "\n(dry-run) Tidak ada yang diubah. Tambahkan --commit untuk menghapus.",
    );
    return;
  }

  const result = await db.$transaction(async (tx) => {
    const vu = await tx.voucherUsage.deleteMany({ where: { userId: { in: ids } } });
    const ce = await tx.certificate.deleteMany({ where: { userId: { in: ids } } });
    const or = await tx.order.deleteMany({ where: { userId: { in: ids } } });
    const ta = await tx.task.deleteMany({ where: { mentorId: { in: ids } } });
    const fg = await tx.finalGrade.deleteMany({ where: { mentorId: { in: ids } } });
    const us = await tx.user.deleteMany({ where: { id: { in: ids } } });
    return { vu, ce, or, ta, fg, us };
  });

  console.log("\n== Selesai (committed) ==");
  console.log(`  voucher_usage dihapus : ${result.vu.count}`);
  console.log(`  certificate dihapus   : ${result.ce.count}`);
  console.log(`  order dihapus         : ${result.or.count}`);
  console.log(`  task dihapus          : ${result.ta.count}`);
  console.log(`  final_grade dihapus   : ${result.fg.count}`);
  console.log(`  user dihapus          : ${result.us.count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
