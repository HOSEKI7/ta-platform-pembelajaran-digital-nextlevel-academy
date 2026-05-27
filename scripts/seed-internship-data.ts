/**
 * Seed a complete, realistic internship dataset so the Peserta-Magang dashboard
 * and attendance pages render real data end-to-end. Idempotent — safe to run
 * repeatedly (upserts by stable id / natural unique key).
 *
 * Creates:
 *   - Batch "Batch 1 2026" (period 14/04/2026 – 04/07/2026)
 *   - Field "Batch 1 - Web Programming" → Class "Batch 1 - Web Programming - A"
 *   - A MENTOR (with MentorProfile → class) and an ADMINISTRATOR test account
 *   - Places the test PESERTA_MAGANG user into the class (InternshipProfile)
 *   - Global Holidays (1 May, 1 Jun, 17–19 Jun 2026)
 *   - Deterministic PRESENT attendance history (past weekdays in-period,
 *     excl. weekends/holidays, with sparse "absent" gaps = no row)
 *   - A few Tasks for the class + the student's NOT_SUBMITTED submissions
 *
 * Run with:  npx tsx scripts/seed-internship-data.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomBytes, scrypt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Role } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

// ---- Password hashing (same scrypt params as @better-auth/utils) ------------
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

/** Create a credential user + account if absent; return the userId either way. */
async function ensureUser(opts: {
  email: string;
  name: string;
  username: string;
  role: Role;
  password: string;
}): Promise<string> {
  const existing = await db.user.findFirst({
    where: { OR: [{ email: opts.email }, { username: opts.username }] },
    select: { id: true },
  });
  if (existing) return existing.id;

  const userId = `user_${randomBytes(12).toString("hex")}`;
  const accountId = `acc_${randomBytes(12).toString("hex")}`;
  const now = new Date();
  const passwordHash = await hashPassword(opts.password);
  await db.$transaction([
    db.user.create({
      data: {
        id: userId,
        email: opts.email,
        name: opts.name,
        username: opts.username,
        emailVerified: true,
        role: opts.role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    }),
    db.account.create({
      data: {
        id: accountId,
        userId,
        accountId: userId,
        providerId: "credential",
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);
  return userId;
}

// ---- Date helpers (date-only fields stored as UTC-midnight) -----------------
/** UTC-midnight Date for a y/m(0-based)/d calendar date — stable for @db.Date. */
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}
/** "09:MM WIB" on a given date → UTC instant (WIB = UTC+7). */
function wibCheckIn(year: number, month: number, day: number, minute: number): Date {
  return new Date(Date.UTC(year, month, day, 2, minute)); // 09:MM WIB = 02:MM UTC
}
function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}
function ymdKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

// ---- Config -----------------------------------------------------------------
const MAGANG_EMAIL = "farzanzr170404@gmail.com";
const MAGANG_NAME = "Aqsha Naya Ruzqa";
const MAGANG_USERNAME = "Naya";
const MAGANG_PASSWORD = "NayaTest123";

const PERIOD_START = utcDate(2026, 3, 14); // 14 Apr 2026
const PERIOD_END = utcDate(2026, 6, 4); // 04 Jul 2026

const HOLIDAYS: Array<{ id: string; start: Date; days: number; description: string }> = [
  { id: "seed_hol_mayday", start: utcDate(2026, 4, 1), days: 1, description: "Hari Buruh Internasional" },
  { id: "seed_hol_pancasila", start: utcDate(2026, 5, 1), days: 1, description: "Hari Lahir Pancasila" },
  { id: "seed_hol_iduladha", start: utcDate(2026, 5, 17), days: 3, description: "Cuti Bersama Idul Adha" },
];

async function main() {
  // 1) Users: magang (likely exists), mentor, admin.
  const magangId = await ensureUser({
    email: MAGANG_EMAIL,
    name: MAGANG_NAME,
    username: MAGANG_USERNAME,
    role: "PESERTA_MAGANG",
    password: MAGANG_PASSWORD,
  });
  const mentorId = await ensureUser({
    email: "mentor.web@nextlevel.local",
    name: "Aldi Pratama",
    username: "mentor_aldi",
    role: "MENTOR",
    password: "MentorTest123",
  });
  await ensureUser({
    email: "admin@nextlevel.local",
    name: "Admin NextLevel",
    username: "admin_nla",
    role: "ADMINISTRATOR",
    password: "AdminTest123",
  });

  // 2) Org chain: Batch → Field → Class.
  const batch = await db.batch.upsert({
    where: { name: "Batch 1 2026" },
    update: { startDate: PERIOD_START, endDate: PERIOD_END },
    create: {
      name: "Batch 1 2026",
      description: "Batch 1 Periode April – Juli 2026",
      startDate: PERIOD_START,
      endDate: PERIOD_END,
    },
  });
  const field = await db.field.upsert({
    where: { name: "Batch 1 - Web Programming" },
    update: {},
    create: { name: "Batch 1 - Web Programming", batchId: batch.id },
  });
  const klass = await db.class.upsert({
    where: { name: "Batch 1 - Web Programming - A" },
    update: {},
    create: { name: "Batch 1 - Web Programming - A", fieldId: field.id, maxStudents: 10 },
  });

  // 3) Profiles: mentor + student placement.
  await db.mentorProfile.upsert({
    where: { userId: mentorId },
    update: { classId: klass.id },
    create: { userId: mentorId, classId: klass.id },
  });
  await db.internshipProfile.upsert({
    where: { userId: magangId },
    update: { classId: klass.id, institution: "Universitas Negeri Surabaya" },
    create: { userId: magangId, classId: klass.id, institution: "Universitas Negeri Surabaya" },
  });

  // 4) Holidays (global).
  const holidaySet = new Set<string>();
  for (const h of HOLIDAYS) {
    const end = utcDate(
      h.start.getUTCFullYear(),
      h.start.getUTCMonth(),
      h.start.getUTCDate() + h.days - 1,
    );
    await db.holiday.upsert({
      where: { id: h.id },
      update: { startDate: h.start, days: h.days, endDate: end, description: h.description },
      create: { id: h.id, startDate: h.start, days: h.days, endDate: end, description: h.description },
    });
    for (let i = 0; i < h.days; i += 1) {
      holidaySet.add(ymdKey(utcDate(h.start.getUTCFullYear(), h.start.getUTCMonth(), h.start.getUTCDate() + i)));
    }
  }

  // 5) Attendance history: PRESENT rows for past weekdays in-period (excl.
  //    weekends/holidays), with deterministic sparse absences (= no row).
  const today = new Date();
  const todayUtc = utcDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  let presentCount = 0;
  for (
    let d = new Date(PERIOD_START);
    d < todayUtc && d <= PERIOD_END;
    d = utcDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)
  ) {
    if (isWeekend(d)) continue;
    if (holidaySet.has(ymdKey(d))) continue;
    const dom = d.getUTCDate();
    const absent = dom % 8 === 5 || dom % 13 === 0; // sparse, reproducible
    if (absent) continue; // omitted → derived TIDAK_HADIR on read
    const checkedInAt = wibCheckIn(d.getUTCFullYear(), d.getUTCMonth(), dom, (dom * 13) % 55);
    await db.attendance.upsert({
      where: { userId_date: { userId: magangId, date: d } },
      update: { status: "PRESENT", checkedInAt },
      create: { userId: magangId, date: d, status: "PRESENT", checkedInAt },
    });
    presentCount += 1;
  }

  // 6) Tasks for the class + the student's NOT_SUBMITTED submissions.
  const now = new Date();
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3_600_000);
  const tasks = [
    { id: "seed_task_setup_db", title: "Setup Database & Prisma Schema", deadline: hoursFromNow(5) },
    { id: "seed_task_landing", title: "Slicing Halaman Landing Page", deadline: hoursFromNow(28) },
    { id: "seed_task_weekly", title: "Laporan Mingguan — Sprint 2", deadline: hoursFromNow(72) },
  ];
  for (const t of tasks) {
    await db.task.upsert({
      where: { id: t.id },
      update: { deadline: t.deadline, classId: klass.id, fieldId: field.id, batchId: batch.id, mentorId },
      create: {
        id: t.id,
        title: t.title,
        description: "Tugas magang yang harus diselesaikan sebelum deadline. Lihat detail untuk instruksi lengkap.",
        deadline: t.deadline,
        mentorId,
        batchId: batch.id,
        fieldId: field.id,
        classId: klass.id,
      },
    });
    await db.taskSubmission.upsert({
      where: { taskId_studentId: { taskId: t.id, studentId: magangId } },
      update: {},
      create: { taskId: t.id, studentId: magangId, status: "NOT_SUBMITTED" },
    });
  }

  console.log("✓ Internship dataset seeded.");
  console.log(`  Batch     : ${batch.name} (${batch.id})`);
  console.log(`  Class     : ${klass.name}`);
  console.log(`  Magang    : ${MAGANG_EMAIL} / ${MAGANG_PASSWORD}`);
  console.log(`  Mentor    : mentor.web@nextlevel.local / MentorTest123`);
  console.log(`  Admin     : admin@nextlevel.local / AdminTest123 (dormant — no admin UI yet)`);
  console.log(`  Holidays  : ${HOLIDAYS.length} · PRESENT rows seeded: ${presentCount}`);
  console.log(`  Tasks     : ${tasks.length} (all NOT_SUBMITTED)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
