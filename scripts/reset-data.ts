/**
 * Wipe all application data so the platform can be exercised from a clean slate
 * (e.g. creating the very first admin account). DESTRUCTIVE & irreversible — no
 * backup is taken. Reusable between test runs.
 *
 * Deletes every domain table (and its children) in leaf→root order so foreign
 * keys with the default Restrict action are not violated. Covers everything the
 * app CRUDs: users (+ sessions/accounts/profiles/progress/notifications),
 * courses (+ slug-history/sprints/steps/videos/quizzes), orders, certificates,
 * vouchers, badges, attendance, tasks, final grades, the internship org structure
 * (batch/field/class), plus Category, Holiday, AuditLog and stale Verification
 * tokens.
 *
 * PRESERVES `platform_setting` (platform configuration — landing-page contact
 * info, certificate expiry, admin last-seen markers). When users are deleted,
 * `platform_setting.updatedBy` is auto-nulled by its `ON DELETE SET NULL` FK.
 *
 * Run with:  npx tsx scripts/reset-data.ts   (or: npm run reset:data)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

// Ordered leaf→root. Each entry is [label, deleteMany]. `platform_setting` is
// intentionally absent — it is the only table we keep.
const DELETIONS: [string, () => Promise<{ count: number }>][] = [
  ["payment_webhook_event", () => db.paymentWebhookEvent.deleteMany()],
  ["voucher_usage", () => db.voucherUsage.deleteMany()],
  ["order", () => db.order.deleteMany()],
  ["certificate", () => db.certificate.deleteMany()],
  ["step_note", () => db.stepNote.deleteMany()],
  ["step_progress", () => db.stepProgress.deleteMany()],
  ["enrollment", () => db.enrollment.deleteMany()],
  ["exp_log", () => db.expLog.deleteMany()],
  ["user_badge", () => db.userBadge.deleteMany()],
  ["user_game_profile", () => db.userGameProfile.deleteMany()],
  ["task_submission", () => db.taskSubmission.deleteMany()],
  ["task", () => db.task.deleteMany()],
  ["final_grade", () => db.finalGrade.deleteMany()],
  ["attendance", () => db.attendance.deleteMany()],
  ["holiday", () => db.holiday.deleteMany()],
  ["notification", () => db.notification.deleteMany()],
  ["quiz_question", () => db.quizQuestion.deleteMany()],
  ["quiz", () => db.quiz.deleteMany()],
  ["video_archive", () => db.videoArchive.deleteMany()],
  ["video", () => db.video.deleteMany()],
  ["step", () => db.step.deleteMany()],
  ["sprint", () => db.sprint.deleteMany()],
  ["course_benefit", () => db.courseBenefit.deleteMany()],
  ["course_faq", () => db.courseFaq.deleteMany()],
  ["badge", () => db.badge.deleteMany()],
  ["voucher", () => db.voucher.deleteMany()],
  ["course_slug_history", () => db.courseSlugHistory.deleteMany()],
  ["course", () => db.course.deleteMany()],
  ["category", () => db.category.deleteMany()],
  ["admin_invite", () => db.adminInvite.deleteMany()],
  ["internship_profile", () => db.internshipProfile.deleteMany()],
  ["mentor_profile", () => db.mentorProfile.deleteMany()],
  ["class", () => db.class.deleteMany()],
  ["field", () => db.field.deleteMany()],
  ["batch", () => db.batch.deleteMany()],
  ["session", () => db.session.deleteMany()],
  ["account", () => db.account.deleteMany()],
  ["verification", () => db.verification.deleteMany()],
  ["audit_log", () => db.auditLog.deleteMany()],
  ["user", () => db.user.deleteMany()],
];

async function main() {
  console.log("\n== Reset data — DESTRUCTIVE wipe (keeps platform_setting) ==\n");

  let total = 0;
  // Sequential (not a single $transaction): some Supabase poolers cap
  // transaction duration, and the ordered list already respects every FK.
  for (const [label, run] of DELETIONS) {
    const { count } = await run();
    total += count;
    console.log(`  ${label.padEnd(26)} -${count}`);
  }

  const keptSettings = await db.platformSetting.count();
  const remainingUsers = await db.user.count();

  console.log(`\n  Total rows deleted: ${total}`);
  console.log(`  platform_setting kept: ${keptSettings} row(s)`);
  console.log(`  users remaining: ${remainingUsers}`);
  console.log(
    remainingUsers === 0
      ? "\n✔ Database is empty — ready to bootstrap the first admin.\n"
      : "\n⚠ Some users still remain — investigate before continuing.\n",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
