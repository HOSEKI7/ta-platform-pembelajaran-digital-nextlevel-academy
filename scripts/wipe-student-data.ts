/**
 * Wipe ALL student-domain (PESERTA_DIDIK) data so the learning side of the
 * platform can be rebuilt from scratch — while preserving every internship
 * record untouched.
 *
 * Deletes (learning domain):
 *   - All courses and their full content tree: sprint → step → video (+
 *     archives) / quiz (+ questions), benefits, FAQs, slug history, category
 *   - All enrollments (→ step progress / step notes), certificates
 *   - All orders (+ voucher usages, payment webhook events), vouchers, badges
 *   - All audit logs
 *   - Every PESERTA_DIDIK user (cascades sessions, accounts, game profile,
 *     badges, EXP logs, notifications)
 *
 * Keeps (internship + staff/platform):
 *   - PESERTA_MAGANG / MENTOR / ADMINISTRATOR users
 *   - batch → field → class, internship_profile, mentor_profile
 *   - task, task_submission, attendance, final_grade, holiday
 *   - platform_setting (nullable FKs pointing at deleted students are NULLed),
 *     admin_invite, verification
 *
 * Safety:
 *   - Default is a dry-run: prints a per-table summary and asks for
 *     confirmation. Pass --yes / -y to skip the prompt.
 *   - Sequential deleteMany leaf→root (no single $transaction — Supabase
 *     poolers cap transaction duration), mirroring scripts/reset-alldata.ts.
 *   - Verifies internship tables are untouched and no PESERTA_DIDIK remains
 *     before exiting 0 (exit 1 otherwise).
 *
 * Run with:  npx tsx scripts/wipe-student-data.ts [--yes]   (npm run wipe:students)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createInterface } from "node:readline";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

type TableOp = {
  label: string;
  count: () => Promise<number>;
  run: () => Promise<{ count: number }>;
};

function askYesNo(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${prompt} (y/N) `, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === "y" || a === "yes");
    });
  });
}

// Learning-domain tables — every row is deleted (leaf → root).
function learningOps(): TableOp[] {
  return [
    { label: "payment_webhook_event", count: () => db.paymentWebhookEvent.count(), run: () => db.paymentWebhookEvent.deleteMany() },
    { label: "voucher_usage", count: () => db.voucherUsage.count(), run: () => db.voucherUsage.deleteMany() },
    { label: "voucher", count: () => db.voucher.count(), run: () => db.voucher.deleteMany() },
    { label: "order", count: () => db.order.count(), run: () => db.order.deleteMany() },
    { label: "certificate", count: () => db.certificate.count(), run: () => db.certificate.deleteMany() },
    { label: "enrollment", count: () => db.enrollment.count(), run: () => db.enrollment.deleteMany() },
    { label: "badge", count: () => db.badge.count(), run: () => db.badge.deleteMany() },
    { label: "course_slug_history", count: () => db.courseSlugHistory.count(), run: () => db.courseSlugHistory.deleteMany() },
    { label: "video_archive", count: () => db.videoArchive.count(), run: () => db.videoArchive.deleteMany() },
    { label: "video", count: () => db.video.count(), run: () => db.video.deleteMany() },
    { label: "quiz_question", count: () => db.quizQuestion.count(), run: () => db.quizQuestion.deleteMany() },
    { label: "quiz", count: () => db.quiz.count(), run: () => db.quiz.deleteMany() },
    { label: "step", count: () => db.step.count(), run: () => db.step.deleteMany() },
    { label: "sprint", count: () => db.sprint.count(), run: () => db.sprint.deleteMany() },
    { label: "course_benefit", count: () => db.courseBenefit.count(), run: () => db.courseBenefit.deleteMany() },
    { label: "course_faq", count: () => db.courseFaq.count(), run: () => db.courseFaq.deleteMany() },
    { label: "course", count: () => db.course.count(), run: () => db.course.deleteMany() },
    { label: "category", count: () => db.category.count(), run: () => db.category.deleteMany() },
    { label: "audit_log", count: () => db.auditLog.count(), run: () => db.auditLog.deleteMany() },
  ];
}

// Rows owned by PESERTA_DIDIK users (all cascade on user delete, but deleted
// explicitly for precise per-table counts).
function studentOps(studentIds: string[]): TableOp[] {
  const inIds = { in: studentIds };
  return [
    { label: "session", count: () => db.session.count({ where: { userId: inIds } }), run: () => db.session.deleteMany({ where: { userId: inIds } }) },
    { label: "account", count: () => db.account.count({ where: { userId: inIds } }), run: () => db.account.deleteMany({ where: { userId: inIds } }) },
    { label: "user_game_profile", count: () => db.userGameProfile.count({ where: { userId: inIds } }), run: () => db.userGameProfile.deleteMany({ where: { userId: inIds } }) },
    { label: "user_badge", count: () => db.userBadge.count({ where: { userId: inIds } }), run: () => db.userBadge.deleteMany({ where: { userId: inIds } }) },
    { label: "exp_log", count: () => db.expLog.count({ where: { userId: inIds } }), run: () => db.expLog.deleteMany({ where: { userId: inIds } }) },
    { label: "notification", count: () => db.notification.count({ where: { userId: inIds } }), run: () => db.notification.deleteMany({ where: { userId: inIds } }) },
    { label: "attendance", count: () => db.attendance.count({ where: { userId: inIds } }), run: () => db.attendance.deleteMany({ where: { userId: inIds } }) },
    { label: "task_submission", count: () => db.taskSubmission.count({ where: { studentId: inIds } }), run: () => db.taskSubmission.deleteMany({ where: { studentId: inIds } }) },
    { label: "final_grade", count: () => db.finalGrade.count({ where: { studentId: inIds } }), run: () => db.finalGrade.deleteMany({ where: { studentId: inIds } }) },
  ];
}

// Defensive NULLs — nullable FKs that would otherwise Restrict the user delete
// if a PESERTA_DIDIK ever ended up as an editor (normally empty).
function defensiveNulls(studentIds: string[]): TableOp[] {
  const inIds = { in: studentIds };
  return [
    { label: "platform_setting.updatedBy", count: () => db.platformSetting.count({ where: { updatedBy: inIds } }), run: () => db.platformSetting.updateMany({ where: { updatedBy: inIds }, data: { updatedBy: null } }) },
    { label: "attendance.editedById", count: () => db.attendance.count({ where: { editedById: inIds } }), run: () => db.attendance.updateMany({ where: { editedById: inIds }, data: { editedById: null } }) },
    { label: "final_grade.lastEditedById", count: () => db.finalGrade.count({ where: { lastEditedById: inIds } }), run: () => db.finalGrade.updateMany({ where: { lastEditedById: inIds }, data: { lastEditedById: null } }) },
    { label: "final_grade.lockedById", count: () => db.finalGrade.count({ where: { lockedById: inIds } }), run: () => db.finalGrade.updateMany({ where: { lockedById: inIds }, data: { lockedById: null } }) },
  ];
}

// Internship + platform tables — must NOT be touched. Counted before and after
// to prove they are unchanged.
function preservedCounts() {
  return [
    { label: "task", run: () => db.task.count() },
    { label: "task_submission", run: () => db.taskSubmission.count() },
    { label: "attendance", run: () => db.attendance.count() },
    { label: "final_grade", run: () => db.finalGrade.count() },
    { label: "holiday", run: () => db.holiday.count() },
    { label: "class", run: () => db.class.count() },
    { label: "field", run: () => db.field.count() },
    { label: "batch", run: () => db.batch.count() },
    { label: "internship_profile", run: () => db.internshipProfile.count() },
    { label: "mentor_profile", run: () => db.mentorProfile.count() },
    { label: "platform_setting", run: () => db.platformSetting.count() },
    { label: "admin_invite", run: () => db.adminInvite.count() },
    { label: "verification", run: () => db.verification.count() },
  ];
}

async function main() {
  const skipPrompt = process.argv.includes("--yes") || process.argv.includes("-y");

  const studentIds = (await db.user.findMany({
    where: { role: "PESERTA_DIDIK" },
    select: { id: true },
  })).map((u) => u.id);

  const learning = learningOps();
  const students = studentOps(studentIds);
  const nulls = defensiveNulls(studentIds);
  const preserved = preservedCounts();

  const learningCounts = await Promise.all(learning.map((op) => op.count()));
  const studentCounts = await Promise.all(students.map((op) => op.count()));
  const nullCounts = await Promise.all(nulls.map((op) => op.count()));
  const preservedBefore = await Promise.all(preserved.map((op) => op.run()));
  const usersByRole = await db.user.groupBy({ by: ["role"], _count: { _all: true } });

  const totalLearning = learningCounts.reduce((a, b) => a + b, 0);
  const totalStudent = studentCounts.reduce((a, b) => a + b, 0);
  const totalNulls = nullCounts.reduce((a, b) => a + b, 0);

  const sep = "\u2500".repeat(56);
  console.log(`\n${sep}`);
  console.log("  WIPE STUDENT DATA \u2014 SUMMARY (dry-run)");
  console.log(`${sep}`);

  console.log("  DELETE \u2014 learning domain (all rows):");
  learning.forEach((op, i) => console.log(`    ${op.label.padEnd(24)} ${learningCounts[i]}`));
  console.log(`    ${"TOTAL".padEnd(24)} ${totalLearning}`);

  console.log("  DELETE \u2014 students (role=PESERTA_DIDIK):");
  console.log(`    ${"user".padEnd(24)} ${studentIds.length}`);
  students.forEach((op, i) => console.log(`    ${op.label.padEnd(24)} ${studentCounts[i]}`));
  console.log(`    ${"TOTAL".padEnd(24)} ${totalStudent + studentIds.length}`);

  console.log("  NULLED \u2014 defensive FK references:");
  nulls.forEach((op, i) => console.log(`    ${op.label.padEnd(24)} ${nullCounts[i]}`));
  console.log(`    ${"TOTAL".padEnd(24)} ${totalNulls}`);

  console.log("  KEPT \u2014 internship & platform (must stay unchanged):");
  preserved.forEach((op, i) => console.log(`    ${op.label.padEnd(24)} ${preservedBefore[i]}`));

  console.log("  USERS remaining by role:");
  for (const row of usersByRole) {
    console.log(`    ${row.role.padEnd(24)} ${row._count._all}`);
  }
  console.log(`${sep}\n`);

  if (studentIds.length === 0) {
    console.warn("  ⚠ No PESERTA_DIDIK users found — only learning-domain data will be wiped.\n");
  }

  if (!skipPrompt) {
    const ok = await askYesNo("  Permanently wipe ALL student-domain data?");
    if (!ok) {
      console.log("  Cancelled.\n");
      return;
    }
  }

  // ── Phase 1: learning domain (all rows, leaf → root) ─────────────────────
  console.log("\n== Deleting learning domain ==");
  let deleted = 0;
  for (let i = 0; i < learning.length; i += 1) {
    const { count } = await learning[i].run();
    deleted += count;
    console.log(`  ${learning[i].label.padEnd(26)} -${count}`);
  }

  // ── Phase 2: defensive NULLs ─────────────────────────────────────────────
  console.log("\n== Nulling defensive FK references ==");
  for (const op of nulls) {
    const { count } = await op.run();
    deleted += count;
    console.log(`  ${op.label.padEnd(26)} -${count}`);
  }

  // ── Phase 3: student rows, then the users themselves ─────────────────────
  console.log("\n== Deleting students ==");
  for (let i = 0; i < students.length; i += 1) {
    const { count } = await students[i].run();
    deleted += count;
    console.log(`  ${students[i].label.padEnd(26)} -${count}`);
  }
  const { count: userDeleted } = await db.user.deleteMany({
    where: { role: "PESERTA_DIDIK" },
  });
  deleted += userDeleted;
  console.log(`  ${"user".padEnd(26)} -${userDeleted}`);

  // ── Verification ─────────────────────────────────────────────────────────
  const preservedAfter = await Promise.all(preserved.map((op) => op.run()));
  const remainingStudents = await db.user.count({ where: { role: "PESERTA_DIDIK" } });
  const settingsKept = await db.platformSetting.count();
  const usersAfter = await db.user.groupBy({ by: ["role"], _count: { _all: true } });

  const preservedDiff = preserved
    .map((op, i) => ({ label: op.label, before: preservedBefore[i], after: preservedAfter[i] }))
    .filter((row) => row.before !== row.after);

  console.log(`\n${sep}`);
  console.log("  WIPE STUDENT DATA \u2014 REPORT");
  console.log(`${sep}`);
  console.log(`  Total rows deleted    : ${deleted}`);
  console.log(`  Students remaining    : ${remainingStudents}`);
  console.log(`  platform_setting kept : ${settingsKept}`);
  console.log(`  Users remaining: ${usersAfter.map((r) => `${r.role}=${r._count._all}`).join(", ") || "none"}`);
  console.log(`${sep}`);

  let exitCode = 0;
  if (remainingStudents > 0) {
    console.error("\n✖ Still PESERTA_DIDIK users remaining — investigate!\n");
    exitCode = 1;
  }
  if (preservedDiff.length > 0) {
    console.error("\n✖ Internship/platform tables CHANGED — aborting with error:");
    for (const row of preservedDiff) {
      console.error(`    ${row.label}: ${row.before} → ${row.after}`);
    }
    console.error();
    exitCode = 1;
  }
  if (exitCode === 0) {
    console.log("✔ All internship & platform data untouched — wipe complete.\n");
  }
  process.exit(exitCode);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
