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
  // Secondary MENTOR test account (shares the same class so the mentor
  // dashboard surfaces real mentees / tasks / attendance out of the box).
  const mentor2Id = await ensureUser({
    email: "wibuforlife01@gmail.com",
    name: "Syarif Hidayat Nainggolan",
    username: "Syarif",
    role: "MENTOR",
    password: "SyarifTest123",
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
  await db.mentorProfile.upsert({
    where: { userId: mentor2Id },
    update: { classId: klass.id },
    create: { userId: mentor2Id, classId: klass.id },
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

  // 6) Tasks + the student's submissions — varied states so the UI tabs exercise
  //    BELUM / TERKUMPUL / DIKEMBALIKAN / TERLEWAT end-to-end.
  const now = new Date();
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3_600_000);

  type SeedTask = {
    id: string;
    title: string;
    description: string;
    deadline: Date;
    attachment?: { url: string; name: string; size: number };
    submission:
      | { state: "BELUM" }
      | { state: "DIKEMBALIKAN"; feedback: string; reviewedHoursAgo: number }
      | {
          state: "TERKUMPUL";
          fileName: string;
          fileSize: number;
          submittedHoursAgo: number;
        };
  };

  const tasks: SeedTask[] = [
    {
      id: "seed_task_dashboard_resp",
      title: "Implementasi Halaman Dashboard Responsif",
      description:
        "Implementasikan ulang halaman dashboard dari desain Figma yang sudah dibagikan.\n\nPerhatikan kerapian breakpoint mobile-first (sm → md → lg) dan konsistensi spacing. Tugas sebelumnya dikembalikan — silakan perbaiki sesuai catatan mentor lalu kumpulkan ulang sebelum tenggat.",
      deadline: hoursFromNow(40),
      attachment: {
        url: "https://www.figma.com/file/example/dashboard-spec",
        name: "Desain Dashboard (Figma)",
        size: 0,
      },
      submission: {
        state: "DIKEMBALIKAN",
        feedback:
          "Kerja bagus untuk versi desktop. Namun pada viewport mobile (≤ 640px) kartu statistik masih menimbulkan horizontal scroll dan padding antar-section terlalu rapat. Tolong perbaiki grid menjadi 1 kolom di mobile dan samakan jarak vertikal antar-kartu, lalu kumpulkan ulang ya. Sisanya sudah oke!",
        reviewedHoursAgo: 14,
      },
    },
    {
      id: "seed_task_jwt_auth",
      title: "Membangun REST API Autentikasi dengan JWT",
      description:
        "Bangun endpoint autentikasi untuk aplikasi magang menggunakan Node.js dan Express.\n\nGunakan JSON Web Token (JWT) untuk sesi, simpan password dengan hashing bcrypt, dan terapkan middleware proteksi route. Sertakan dokumentasi singkat (README) cara menjalankannya secara lokal.",
      deadline: hoursFromNow(24 * 5 + 17),
      attachment: {
        url: "https://docs.google.com/document/d/example/auth-spec",
        name: "Panduan REST API Auth (Google Docs)",
        size: 0,
      },
      submission: { state: "BELUM" },
    },
    {
      id: "seed_task_atomic_design",
      title: "Refactor Komponen ke Pola Atomic Design",
      description:
        "Rapikan struktur komponen frontend mengikuti pola Atomic Design (atoms, molecules, organisms).\n\nFokus pada reusability dan penamaan yang konsisten. Tidak perlu mengubah tampilan akhir — cukup struktur dan organisasi kode.",
      deadline: hoursFromNow(24 * 14),
      submission: {
        state: "TERKUMPUL",
        fileName: "refactor-atomic-design.zip",
        fileSize: 2_201_600,
        submittedHoursAgo: 10,
      },
    },
    {
      id: "seed_task_midtrans",
      title: "Integrasi Pembayaran Midtrans (Sandbox)",
      description:
        "Integrasikan gateway pembayaran Midtrans pada mode sandbox.\n\nGunakan Snap untuk menampilkan popup pembayaran, lalu tangani status transaksi melalui webhook. Pastikan alur idempoten — satu transaksi sukses tidak boleh diproses dua kali.",
      deadline: hoursFromNow(24 * 20),
      attachment: {
        url: "https://docs.midtrans.com/docs/snap-overview",
        name: "Dokumentasi Midtrans Snap",
        size: 0,
      },
      submission: { state: "BELUM" },
    },
    {
      id: "seed_task_setup_proyek",
      title: "Setup Proyek & Konfigurasi ESLint + Prettier",
      description:
        "Inisialisasi repository proyek magang, konfigurasikan ESLint dan Prettier, serta siapkan struktur folder dasar.\n\nPastikan perintah lint dan format berjalan tanpa error.",
      deadline: hoursFromNow(-24 * 24),
      submission: {
        state: "TERKUMPUL",
        fileName: "setup-proyek-magang.zip",
        fileSize: 901_120,
        submittedHoursAgo: 24 * 25,
      },
    },
    {
      id: "seed_task_optimasi_query",
      title: "Studi Kasus: Optimasi Query Database",
      description:
        "Analisis sebuah query lambat yang diberikan, lalu tulis laporan berisi penyebab dan strategi optimasi (indexing, denormalisasi, atau perbaikan query).\n\nSertakan perbandingan waktu eksekusi sebelum dan sesudah optimasi.",
      deadline: hoursFromNow(-24 * 16),
      submission: { state: "BELUM" }, // derived TERLEWAT (deadline past + not submitted)
    },
  ];

  // Idempotent cleanup of obsolete seed tasks (e.g. from earlier seed versions).
  const expectedIds = tasks.map((t) => t.id);
  await db.task.deleteMany({
    where: {
      AND: [
        { id: { startsWith: "seed_task_" } },
        { id: { notIn: expectedIds } },
      ],
    },
  });

  // Task descriptions are now rich-text HTML (rendered via RichTextContent on
  // the detail page). Convert the plain-text seed copy into simple paragraphs.
  const toDescriptionHtml = (text: string): string =>
    text
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>").trim()}</p>`)
      .filter((p) => p !== "<p></p>")
      .join("");

  for (const t of tasks) {
    await db.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        description: toDescriptionHtml(t.description),
        deadline: t.deadline,
        attachmentUrl: t.attachment?.url ?? null,
        attachmentName: t.attachment?.name ?? null,
        attachmentSize: t.attachment?.size ?? null,
        classId: klass.id,
        fieldId: field.id,
        batchId: batch.id,
        mentorId,
      },
      create: {
        id: t.id,
        title: t.title,
        description: toDescriptionHtml(t.description),
        deadline: t.deadline,
        attachmentUrl: t.attachment?.url ?? null,
        attachmentName: t.attachment?.name ?? null,
        attachmentSize: t.attachment?.size ?? null,
        mentorId,
        batchId: batch.id,
        fieldId: field.id,
        classId: klass.id,
      },
    });

    const s = t.submission;
    if (s.state === "BELUM") {
      await db.taskSubmission.upsert({
        where: { taskId_studentId: { taskId: t.id, studentId: magangId } },
        update: {
          status: "NOT_SUBMITTED",
          submissionUrl: null,
          submissionFileName: null,
          submissionFileSize: null,
          feedbackText: null,
          reviewedAt: null,
        },
        create: { taskId: t.id, studentId: magangId, status: "NOT_SUBMITTED" },
      });
    } else if (s.state === "DIKEMBALIKAN") {
      const reviewedAt = hoursFromNow(-s.reviewedHoursAgo);
      await db.taskSubmission.upsert({
        where: { taskId_studentId: { taskId: t.id, studentId: magangId } },
        update: {
          status: "NOT_SUBMITTED",
          submissionUrl: null,
          submissionFileName: null,
          submissionFileSize: null,
          feedbackText: s.feedback,
          reviewedAt,
        },
        create: {
          taskId: t.id,
          studentId: magangId,
          status: "NOT_SUBMITTED",
          feedbackText: s.feedback,
          reviewedAt,
        },
      });
    } else {
      // TERKUMPUL — submissionUrl points at a dummy Bunny path so the loader has
      // something to sign; the file itself doesn't exist in storage for seed
      // rows, so the download link will 404 until the student submits for real.
      const submittedAt = hoursFromNow(-s.submittedHoursAgo);
      const dummyPath = `submissions/${t.id}/${magangId}/seed-${s.fileName}`;
      await db.taskSubmission.upsert({
        where: { taskId_studentId: { taskId: t.id, studentId: magangId } },
        update: {
          status: "SUBMITTED",
          submissionUrl: dummyPath,
          submissionFileName: s.fileName,
          submissionFileSize: s.fileSize,
          submittedAt,
          feedbackText: null,
          reviewedAt: null,
        },
        create: {
          taskId: t.id,
          studentId: magangId,
          status: "SUBMITTED",
          submissionUrl: dummyPath,
          submissionFileName: s.fileName,
          submissionFileSize: s.fileSize,
          submittedAt,
        },
      });
    }
  }

  console.log("✓ Internship dataset seeded.");
  console.log(`  Batch     : ${batch.name} (${batch.id})`);
  console.log(`  Class     : ${klass.name}`);
  console.log(`  Magang    : ${MAGANG_EMAIL} / ${MAGANG_PASSWORD}`);
  console.log(`  Mentor    : mentor.web@nextlevel.local / MentorTest123`);
  console.log(`  Mentor 2  : wibuforlife01@gmail.com / SyarifTest123`);
  console.log(`  Admin     : admin@nextlevel.local / AdminTest123 (dormant — no admin UI yet)`);
  console.log(`  Holidays  : ${HOLIDAYS.length} · PRESENT rows seeded: ${presentCount}`);
  console.log(`  Tasks     : ${tasks.length} (mix of BELUM / TERKUMPUL / DIKEMBALIKAN / TERLEWAT)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
