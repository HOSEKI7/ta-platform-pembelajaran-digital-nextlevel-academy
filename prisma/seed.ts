/**
 * Dummy seed data for NextLevel Academy.
 *
 * Run with:  npx tsx prisma/seed.ts
 *
 * Idempotent: uses upsert / unique slugs so re-running won't create duplicates.
 * Users have no Account row — they exist for visual inspection only and cannot
 * log in. Real auth flows go through Better Auth, which creates the Account.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { nanoid } from "nanoid";
import {
  AttendanceStatus,
  BadgeTrigger,
  CourseStatus,
  ExpSource,
  NotificationType,
  OrderStatus,
  PrismaClient,
  Role,
  StepType,
  SubmissionStatus,
} from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  console.log("Seeding NextLevel Academy…");

  // --- Platform settings -----------------------------------------------------
  await db.platformSetting.upsert({
    where: { key: "certificate_expiry_years" },
    create: { key: "certificate_expiry_years", value: "3" },
    update: { value: "3" },
  });
  await db.platformSetting.upsert({
    where: { key: "attendance_window_start" },
    create: { key: "attendance_window_start", value: "09:00" },
    update: { value: "09:00" },
  });
  await db.platformSetting.upsert({
    where: { key: "attendance_window_end" },
    create: { key: "attendance_window_end", value: "12:00" },
    update: { value: "12:00" },
  });

  // --- Users (Better Auth schema; no password set in seed) -------------------
  const admin = await db.user.upsert({
    where: { email: "admin@nextlevel.local" },
    create: {
      id: nanoid(),
      email: "admin@nextlevel.local",
      name: "Admin NextLevel",
      role: Role.ADMINISTRATOR,
      emailVerified: true,
    },
    update: {},
  });

  const student = await db.user.upsert({
    where: { email: "rafi@nextlevel.local" },
    create: {
      id: nanoid(),
      email: "rafi@nextlevel.local",
      name: "Rafi Pratama",
      username: "rafi",
      role: Role.PESERTA_DIDIK,
      emailVerified: true,
      gameProfile: { create: { exp: 240, level: 2, totalExp: 984 } },
    },
    update: {},
  });

  const mentor = await db.user.upsert({
    where: { email: "budi@nextlevel.local" },
    create: {
      id: nanoid(),
      email: "budi@nextlevel.local",
      name: "Budi Santoso",
      role: Role.MENTOR,
      emailVerified: true,
    },
    update: {},
  });

  const intern = await db.user.upsert({
    where: { email: "siti@nextlevel.local" },
    create: {
      id: nanoid(),
      email: "siti@nextlevel.local",
      name: "Siti Aminah",
      role: Role.PESERTA_MAGANG,
      emailVerified: true,
    },
    update: {},
  });

  // --- Internship org structure ---------------------------------------------
  const batch = await db.batch.upsert({
    where: { name: "Batch 1 2026" },
    create: { name: "Batch 1 2026", description: "Periode Mei – Juli 2026" },
    update: {},
  });

  const field = await db.field.upsert({
    where: { name: "Batch 1 2026 - Web Programming" },
    create: { name: "Batch 1 2026 - Web Programming", batchId: batch.id },
    update: {},
  });

  const klass = await db.class.upsert({
    where: { name: "Batch 1 2026 - Web Programming - A" },
    create: {
      name: "Batch 1 2026 - Web Programming - A",
      fieldId: field.id,
      maxStudents: 10,
    },
    update: {},
  });

  await db.mentorProfile.upsert({
    where: { userId: mentor.id },
    create: { userId: mentor.id, classId: klass.id },
    update: { classId: klass.id },
  });
  await db.internshipProfile.upsert({
    where: { userId: intern.id },
    create: {
      userId: intern.id,
      classId: klass.id,
      institution: "Universitas Indonesia",
    },
    update: { classId: klass.id },
  });

  // --- Course catalog --------------------------------------------------------
  const category = await db.category.upsert({
    where: { name: "Web Programming" },
    create: { name: "Web Programming" },
    update: {},
  });

  const course = await db.course.upsert({
    where: { slug: "belajar-next-js-untuk-pemula" },
    create: {
      title: "Belajar Next.js untuk Pemula",
      slug: "belajar-next-js-untuk-pemula",
      description:
        "Kursus lengkap untuk memulai pengembangan aplikasi web modern dengan Next.js, dari setup hingga deployment.",
      categoryId: category.id,
      thumbnailUrl: "https://placehold.co/600x400/png?text=Next.js+Pemula",
      price: 299_000,
      fakePrice: 499_000,
      estimatedDuration: 480,
      instructor: "Andi Saputra",
      instructorBio: "Full-stack developer dengan 8 tahun pengalaman di industri.",
      instructorImg: "https://placehold.co/200x200/png?text=Andi",
      status: CourseStatus.PUBLISHED,
      benefits: {
        create: [
          { text: "Memahami konsep App Router dan Route Handlers", order: 1 },
          { text: "Membangun aplikasi fullstack dengan TypeScript", order: 2 },
          { text: "Deploy ke production dengan best practice", order: 3 },
        ],
      },
      faqs: {
        create: [
          {
            question: "Apakah ada prasyarat untuk mengikuti kursus ini?",
            answer: "Pengetahuan dasar HTML, CSS, dan JavaScript sangat dianjurkan.",
            order: 1,
          },
          {
            question: "Berapa lama akses kursus ini?",
            answer: "Akses lifetime — selama platform aktif.",
            order: 2,
          },
        ],
      },
    },
    update: {},
  });

  // Sprint with one video step + one quiz step
  const sprint = await db.sprint.upsert({
    where: { id: `seed-sprint-${course.id}` },
    create: {
      id: `seed-sprint-${course.id}`,
      courseId: course.id,
      title: "Sprint 1: Fondasi Next.js",
      order: 1,
    },
    update: {},
  });

  const videoStep = await db.step.upsert({
    where: { id: `seed-step-video-${sprint.id}` },
    create: {
      id: `seed-step-video-${sprint.id}`,
      sprintId: sprint.id,
      title: "Pengenalan App Router",
      type: StepType.VIDEO,
      order: 1,
      description: "Video pengenalan struktur folder App Router di Next.js.",
      video: {
        create: {
          bunnyVideoId: "00000000-0000-0000-0000-000000000001",
          duration: 600,
        },
      },
    },
    update: {},
  });

  await db.step.upsert({
    where: { id: `seed-step-quiz-${sprint.id}` },
    create: {
      id: `seed-step-quiz-${sprint.id}`,
      sprintId: sprint.id,
      title: "Kuis: Konsep Dasar",
      type: StepType.QUIZ,
      order: 2,
      description: "Tes pemahaman dasar setelah video pertama.",
      quiz: {
        create: {
          passingScore: 80,
          questions: {
            create: [
              {
                question: "Apa nama folder utama App Router di Next.js?",
                options: ["pages", "app", "routes", "src"],
                answer: 1,
                order: 1,
              },
              {
                question: "File apa yang dipakai untuk membuat Route Handler?",
                options: ["api.ts", "handler.ts", "route.ts", "server.ts"],
                answer: 2,
                order: 2,
              },
            ],
          },
        },
      },
    },
    update: {},
  });

  // --- Enrollment for the student -------------------------------------------
  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    create: {
      userId: student.id,
      courseId: course.id,
      progressPct: 50,
    },
    update: {},
  });

  // Mark the video step complete and log the EXP grant
  await db.stepProgress.upsert({
    where: {
      enrollmentId_stepId: { enrollmentId: enrollment.id, stepId: videoStep.id },
    },
    create: {
      enrollmentId: enrollment.id,
      stepId: videoStep.id,
      isCompleted: true,
      completedAt: new Date(),
    },
    update: {},
  });
  await db.expLog.upsert({
    where: {
      userId_source_refId: {
        userId: student.id,
        source: ExpSource.VIDEO_COMPLETE,
        refId: videoStep.id,
      },
    },
    create: {
      userId: student.id,
      amount: 15,
      source: ExpSource.VIDEO_COMPLETE,
      refId: videoStep.id,
    },
    update: {},
  });

  // --- Order (paid) ----------------------------------------------------------
  await db.order.upsert({
    where: { paymentInvoiceId: "INV-SEED-0001" },
    create: {
      userId: student.id,
      courseId: course.id,
      originalPrice: 299_000,
      discountAmount: 0,
      finalPrice: 299_000,
      status: OrderStatus.SUCCESS,
      paymentInvoiceId: "INV-SEED-0001",
      paymentMethod: "QRIS",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      paidAt: new Date(),
    },
    update: {},
  });

  // --- Badge -----------------------------------------------------------------
  await db.badge.upsert({
    where: { id: "seed-badge-beginner" },
    create: {
      id: "seed-badge-beginner",
      name: "Beginner",
      description: "Diberikan saat user mencapai level 1.",
      trigger: BadgeTrigger.LEVEL_REACHED,
      threshold: 1,
      logoUrl: "https://placehold.co/128x128/png?text=B",
    },
    update: {},
  });

  // --- Voucher ---------------------------------------------------------------
  await db.voucher.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      description: "Diskon 10% untuk pelajar baru",
      discountPct: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxUsage: 100,
      maxUsagePerUser: 1,
      isActive: true,
    },
    update: {},
  });

  // --- Internship: attendance + task + final grade ---------------------------
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await db.attendance.upsert({
    where: { userId_date: { userId: intern.id, date: today } },
    create: {
      userId: intern.id,
      date: today,
      status: AttendanceStatus.PRESENT,
      checkedInAt: new Date(),
    },
    update: {},
  });

  const task = await db.task.upsert({
    where: { id: "seed-task-1" },
    create: {
      id: "seed-task-1",
      mentorId: mentor.id,
      batchId: batch.id,
      fieldId: field.id,
      classId: klass.id,
      title: "Tugas 1: Setup proyek Next.js",
      description:
        "Buat repository Next.js baru, push ke GitHub, dan kumpulkan link repo-nya.",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });

  await db.taskSubmission.upsert({
    where: { taskId_studentId: { taskId: task.id, studentId: intern.id } },
    create: {
      taskId: task.id,
      studentId: intern.id,
      status: SubmissionStatus.NOT_SUBMITTED,
    },
    update: {},
  });

  await db.finalGrade.upsert({
    where: { studentId: intern.id },
    create: { studentId: intern.id, mentorId: mentor.id },
    update: {},
  });

  // --- Notification ----------------------------------------------------------
  await db.notification.create({
    data: {
      userId: intern.id,
      title: "Tugas baru dari mentor",
      message: `Tugas \"${task.title}\" telah ditambahkan. Cek detailnya sekarang.`,
      type: NotificationType.TASK_ASSIGNED,
      refId: task.id,
    },
  });

  console.log("Seed selesai.");
  console.log({
    users: { admin: admin.email, student: student.email, mentor: mentor.email, intern: intern.email },
    course: course.slug,
    class: klass.name,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
