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
        "Kursus lengkap untuk memulai pengembangan aplikasi web modern dengan Next.js, dari setup hingga deployment. Materi disusun bertahap mulai dari konsep dasar App Router, routing dinamis, data fetching, hingga deployment ke production. Cocok untuk pemula yang sudah familiar dengan JavaScript dan ingin lompat ke ekosistem React modern.",
      shortDescription:
        "Dari setup hingga deployment, kuasai Next.js 16 dengan pendekatan praktis dan project-based.",
      categoryId: category.id,
      thumbnailUrl: "https://placehold.co/800x500/478ef4/ffffff/png?text=Next.js+Pemula",
      price: 299_000,
      fakePrice: 499_000,
      estimatedDuration: 480,
      instructor: "Andi Saputra",
      instructorBio:
        "Full-stack developer dengan 8 tahun pengalaman di industri. Pernah memimpin tim engineering di dua startup unicorn di Jakarta dan kontributor open-source di ekosistem React. Dikenal lewat workshop \"React in Production\" yang diikuti lebih dari 2.000 peserta. Saat ini fokus berbagi tentang pola arsitektur Next.js modern, performance, dan developer experience.",
      instructorImg: "https://placehold.co/200x200/png?text=Andi",
      status: CourseStatus.PUBLISHED,
      isFeatured: true,
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
            answer:
              "Pengetahuan dasar HTML, CSS, dan JavaScript sangat dianjurkan. Familiaritas dengan TypeScript akan membantu, tapi tidak wajib — kita akan ulas konsep dasarnya seperlunya.",
            order: 1,
          },
          {
            question: "Berapa lama akses kursus ini?",
            answer: "Akses lifetime — selama platform aktif. Update materi gratis.",
            order: 2,
          },
          {
            question: "Versi Next.js berapa yang dipakai?",
            answer:
              "Next.js 16 dengan App Router dan Turbopack. Konsep yang dipelajari relevan untuk versi 13 ke atas.",
            order: 3,
          },
        ],
      },
    },
    update: {
      shortDescription:
        "Dari setup hingga deployment, kuasai Next.js 16 dengan pendekatan praktis dan project-based.",
    },
  });

  // --- Additional dummy courses (4 more) ------------------------------------
  await seedCourse(db, {
    slug: "belajar-python-data-science",
    title: "Belajar Python untuk Data Science",
    categoryName: "Data Science",
    thumbnailUrl: "https://placehold.co/800x500/234189/F4D600/png?text=Python+Data+Science",
    price: 349_000,
    fakePrice: 599_000,
    estimatedDuration: 540,
    isFeatured: true,
    shortDescription:
      "Dari sintaks dasar Python ke analisis data nyata dengan Pandas, NumPy, dan Matplotlib.",
    description:
      "Pelajari Python sebagai bahasa pertama untuk data science. Kursus ini dimulai dari fundamental Python — tipe data, control flow, fungsi — kemudian beralih ke library inti analisis data seperti NumPy untuk komputasi numerik, Pandas untuk manipulasi tabel, dan Matplotlib/Seaborn untuk visualisasi. Diakhiri dengan project mini eksplorasi dataset publik Indonesia.",
    instructor: "Dr. Lestari Wibowo",
    instructorBio:
      "Data scientist senior dengan 10 tahun pengalaman, sebelumnya peneliti di BPS dan lead analytics di e-commerce nasional. Mengajar mata kuliah Statistika Komputasi di UI dan rutin mengisi workshop data literacy. Fokus pada storytelling lewat data — bagaimana angka berubah menjadi keputusan.",
    benefits: [
      "Menguasai sintaks Python dari nol",
      "Manipulasi data tabular dengan Pandas",
      "Visualisasi data dengan Matplotlib dan Seaborn",
      "Eksplorasi dataset publik untuk portfolio",
    ],
    faqs: [
      {
        q: "Apakah harus bisa matematika tingkat lanjut?",
        a: "Tidak. Cukup matematika SMA. Statistika dasar yang dibutuhkan akan kita bahas dari awal.",
      },
      {
        q: "Tools apa yang dipakai?",
        a: "Python 3.12, JupyterLab, dan VS Code. Semua gratis dan akan kita install bareng di sprint pertama.",
      },
      {
        q: "Cocok untuk pemula total?",
        a: "Cocok. Sprint pertama dirancang untuk yang belum pernah ngoding sama sekali.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Fondasi Python",
        steps: [
          {
            title: "Setup environment & Hello World",
            type: StepType.VIDEO,
            description:
              "Instalasi Python, Jupyter, dan VS Code di Windows/Mac/Linux. Menjalankan script pertama dan memahami struktur file proyek Python.",
          },
          {
            title: "Tipe data, variabel, dan operator",
            type: StepType.VIDEO,
            description:
              "Penjelasan int, float, string, boolean, list, tuple, dict, dan set — kapan masing-masing dipakai dengan contoh kasus analitik sehari-hari.",
          },
          {
            title: "Kuis: Dasar Python",
            type: StepType.QUIZ,
            description:
              "Mengukur pemahaman sintaks dasar dan tipe data sebelum lanjut ke control flow.",
          },
        ],
      },
      {
        title: "Sprint 2: Analisis Data dengan Pandas",
        steps: [
          {
            title: "Mengenal DataFrame",
            type: StepType.VIDEO,
            description:
              "Membaca CSV, melihat head/tail, info, dan describe. Memahami konsep index, kolom, dan dtypes.",
          },
          {
            title: "Filter, group, dan aggregate",
            type: StepType.VIDEO,
            description:
              "Operasi inti analisis: boolean filter, groupby, agg, pivot_table. Latihan langsung dengan dataset penjualan ritel.",
          },
        ],
      },
    ],
  });

  await seedCourse(db, {
    slug: "dasar-ui-ux-figma",
    title: "Dasar UI/UX Design dengan Figma",
    categoryName: "UI/UX Design",
    thumbnailUrl: "https://placehold.co/800x500/F4D600/234189/png?text=UI%2FUX+Figma",
    price: 249_000,
    fakePrice: 449_000,
    estimatedDuration: 420,
    isFeatured: true,
    shortDescription:
      "Membangun fondasi desain produk: dari riset cepat, wireframe, sampai prototipe interaktif di Figma.",
    description:
      "Kursus desain produk berorientasi praktik. Mulai dari prinsip desain visual (hierarki, tipografi, warna), proses UX singkat (problem statement, user flow, wireframe), hingga membangun prototype klikable di Figma. Cocok untuk yang ingin masuk dunia UI/UX tanpa background desain formal.",
    instructor: "Rina Hapsari",
    instructorBio:
      "Senior product designer dengan 7 tahun pengalaman di fintech dan healthtech. Sebelumnya design lead di sebuah startup B2B SaaS, kini consultant lepas untuk tim produk yang baru terbentuk. Pendukung sistem desain yang sederhana — \"komponen sedikit, konsisten banyak\".",
    benefits: [
      "Memahami prinsip dasar visual design",
      "Menyusun user flow dan wireframe yang dipahami tim",
      "Membangun prototipe interaktif di Figma",
      "Menyajikan portfolio yang menjelaskan keputusan desain",
    ],
    faqs: [
      {
        q: "Perlu langganan Figma berbayar?",
        a: "Tidak. Paket Figma gratis sudah cukup untuk semua materi kursus.",
      },
      {
        q: "Apakah materi cocok untuk pemula total?",
        a: "Sangat cocok. Tidak ada prasyarat. Kita mulai dari mengenal interface Figma.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Prinsip Desain & Figma Basics",
        steps: [
          {
            title: "Kenalan dengan Figma",
            type: StepType.VIDEO,
            description:
              "Tour interface, frame, shape, dan auto-layout dasar. Membuat satu halaman onboarding sederhana sebagai pemanasan.",
          },
          {
            title: "Tipografi dan warna",
            type: StepType.VIDEO,
            description:
              "Memilih font yang readable, hierarki ukuran, kontras warna, dan cara membaca aksesibilitas WCAG.",
          },
        ],
      },
      {
        title: "Sprint 2: Wireframe ke Prototype",
        steps: [
          {
            title: "User flow dan wireframe",
            type: StepType.VIDEO,
            description:
              "Membuat flow login → dashboard, dengan wireframe low-fidelity sebagai sketsa cepat sebelum desain high-fidelity.",
          },
          {
            title: "Prototype interaktif",
            type: StepType.VIDEO,
            description:
              "Menghubungkan frame dengan trigger klik, smart animate, dan overlay. Berbagi link prototype untuk testing.",
          },
          {
            title: "Kuis: Prinsip & Tools",
            type: StepType.QUIZ,
            description:
              "Mengukur pemahaman prinsip visual dan kemampuan operasional Figma sebelum naik ke topik lanjutan.",
          },
        ],
      },
    ],
  });

  await seedCourse(db, {
    slug: "flutter-untuk-pemula",
    title: "Flutter untuk Pemula: Bangun Aplikasi Mobile Pertama",
    categoryName: "Mobile Development",
    thumbnailUrl: "https://placehold.co/800x500/2B72EA/ffffff/png?text=Flutter+Mobile",
    price: 329_000,
    fakePrice: 549_000,
    estimatedDuration: 510,
    isFeatured: true,
    shortDescription:
      "Tulis sekali, jalan di Android dan iOS. Mulai dari widget dasar sampai integrasi REST API.",
    description:
      "Belajar membangun aplikasi mobile cross-platform dengan Flutter dan Dart. Kursus ini mencakup konsep widget tree, state management dengan Provider, navigation, integrasi REST API, dan persistensi data lokal. Diakhiri dengan project membangun aplikasi to-do list lengkap dengan auth sederhana.",
    instructor: "Bagus Prasetyo",
    instructorBio:
      "Mobile engineer dengan pengalaman 6 tahun di tim Android dan iOS native, kemudian pindah ke Flutter sejak versi 1.5. Pernah membangun aplikasi e-commerce dengan 500k+ pengguna aktif. Senang menjelaskan konsep abstrak dengan analogi sehari-hari.",
    benefits: [
      "Memahami konsep widget tree dan stateful/stateless",
      "Membangun navigasi multi-screen yang bersih",
      "Integrasi dengan REST API dan handling error",
      "Publikasi build pertama ke Play Store internal track",
    ],
    faqs: [
      {
        q: "Perlu laptop spek tinggi?",
        a: "Minimal RAM 8 GB. Kita pakai emulator Android Studio yang cukup memakan resource — alternatifnya jalankan di device fisik.",
      },
      {
        q: "Bisa dipakai di Mac untuk build iOS?",
        a: "Bisa. Untuk Windows, build iOS perlu CI cloud — kita bahas opsinya di sprint terakhir.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Dart & Widget Fundamental",
        steps: [
          {
            title: "Setup Flutter SDK",
            type: StepType.VIDEO,
            description:
              "Instalasi Flutter, Dart, dan Android Studio. Konfigurasi PATH dan menjalankan `flutter doctor` sampai semua centang.",
          },
          {
            title: "Widget pertama: Stateless vs Stateful",
            type: StepType.VIDEO,
            description:
              "Memahami perbedaan dua jenis widget utama dan kapan menggunakannya, dengan contoh counter app klasik.",
          },
        ],
      },
      {
        title: "Sprint 2: Navigation & API",
        steps: [
          {
            title: "Navigasi multi-screen",
            type: StepType.VIDEO,
            description:
              "Mengenal Navigator.push, named route, dan passing argument antar layar dengan pola yang scalable.",
          },
          {
            title: "Fetch REST API",
            type: StepType.VIDEO,
            description:
              "Memakai package `http`, parse JSON, dan menampilkan list dari API publik (JSONPlaceholder) di ListView.",
          },
          {
            title: "Kuis: Navigasi & State",
            type: StepType.QUIZ,
            description:
              "Mengukur pemahaman navigasi, lifecycle widget, dan dasar state management sebelum project akhir.",
          },
        ],
      },
    ],
  });

  await seedCourse(db, {
    slug: "digital-marketing-fundamental",
    title: "Digital Marketing Fundamental untuk Pemilik Bisnis",
    categoryName: "Marketing",
    thumbnailUrl: "https://placehold.co/800x500/22C55E/ffffff/png?text=Digital+Marketing",
    price: 199_000,
    fakePrice: 399_000,
    estimatedDuration: 360,
    shortDescription:
      "Strategi marketing online yang relevan untuk UMKM Indonesia: organik, berbayar, dan analitik.",
    description:
      "Kursus praktis untuk pemilik bisnis kecil-menengah yang ingin memahami marketing digital tanpa jargon berlebihan. Mencakup riset audiens, content marketing organik (Instagram, TikTok), iklan berbayar dasar (Meta Ads), dan dasar analytics — apa yang harus diukur dan diabaikan.",
    instructor: "Tania Kusuma",
    instructorBio:
      "Marketing consultant untuk UMKM dan founder agensi mikro yang sudah membantu 80+ brand lokal sejak 2018. Sebelumnya brand manager di FMCG. Pendekatannya: angka di atas asumsi, eksperimen di atas template. Senang membongkar studi kasus brand kecil yang viral.",
    benefits: [
      "Memahami funnel marketing yang relevan untuk UMKM",
      "Membuat content calendar 30 hari pertama",
      "Menjalankan iklan Meta dengan budget mulai Rp 50rb/hari",
      "Membaca metrik dan tahu apa yang bisa diabaikan",
    ],
    faqs: [
      {
        q: "Perlu modal awal untuk iklan?",
        a: "Tidak wajib di awal. Materi organik gratis di-cover dulu; materi iklan bisa dipraktikkan dengan budget mini Rp 50–100rb/hari.",
      },
      {
        q: "Apakah relevan untuk bisnis offline juga?",
        a: "Relevan. Kita bahas omnichannel — bagaimana konten online mendukung kunjungan offline (studi kasus warung kopi dan toko buku).",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Strategi & Konten Organik",
        steps: [
          {
            title: "Memahami funnel marketing",
            type: StepType.VIDEO,
            description:
              "Awareness → Consideration → Conversion → Retention. Bagaimana memetakan konten dan kanal untuk setiap tahap funnel.",
          },
          {
            title: "Content calendar 30 hari",
            type: StepType.VIDEO,
            description:
              "Template Notion/Spreadsheet untuk menyusun ide konten satu bulan ke depan, dengan formula 70-20-10 (edukasi-engagement-promosi).",
          },
        ],
      },
      {
        title: "Sprint 2: Iklan Berbayar & Analytics",
        steps: [
          {
            title: "Iklan Meta dasar",
            type: StepType.VIDEO,
            description:
              "Setup pixel, audience custom dan lookalike, struktur campaign-adset-ad, serta budget split yang aman untuk pemula.",
          },
          {
            title: "Analytics yang penting",
            type: StepType.VIDEO,
            description:
              "CPM, CTR, CPC, CPA — kapan masing-masing dipakai sebagai indikator, dan kapan kita boleh mengabaikan.",
          },
          {
            title: "Kuis: Funnel & Metrik",
            type: StepType.QUIZ,
            description:
              "Memvalidasi pemahaman funnel marketing dan kemampuan membaca metrik kampanye sebelum kesimpulan akhir.",
          },
        ],
      },
    ],
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

  // --- Badges (PRD §6.7.3) ---------------------------------------------------
  // Level badges (LEVEL_REACHED) + completion badges (COURSES_COMPLETED).
  const seedBadges = [
    {
      id: "seed-badge-beginner",
      name: "Beginner",
      description: "Diberikan saat mencapai Level 1.",
      trigger: BadgeTrigger.LEVEL_REACHED,
      threshold: 1,
      logoUrl: "https://placehold.co/128x128/png?text=B",
    },
    {
      id: "seed-badge-explorer",
      name: "Explorer",
      description: "Capai Level 5 untuk membuka badge ini.",
      trigger: BadgeTrigger.LEVEL_REACHED,
      threshold: 5,
      logoUrl: "https://placehold.co/128x128/png?text=E",
    },
    {
      id: "seed-badge-scholar",
      name: "Scholar",
      description: "Capai Level 10 untuk membuka badge ini.",
      trigger: BadgeTrigger.LEVEL_REACHED,
      threshold: 10,
      logoUrl: "https://placehold.co/128x128/png?text=S",
    },
    {
      id: "seed-badge-master",
      name: "Master",
      description: "Capai Level 15 — pencapaian tertinggi.",
      trigger: BadgeTrigger.LEVEL_REACHED,
      threshold: 15,
      logoUrl: "https://placehold.co/128x128/png?text=M",
    },
    {
      id: "seed-badge-course-champion",
      name: "Course Champion",
      description: "Selesaikan 3 kursus berbeda hingga 100%.",
      trigger: BadgeTrigger.COURSES_COMPLETED,
      threshold: 3,
      logoUrl: "https://placehold.co/128x128/png?text=C3",
    },
    {
      id: "seed-badge-marathoner",
      name: "Marathoner",
      description: "Selesaikan 10 kursus berbeda hingga 100%.",
      trigger: BadgeTrigger.COURSES_COMPLETED,
      threshold: 10,
      logoUrl: "https://placehold.co/128x128/png?text=C10",
    },
  ];
  for (const b of seedBadges) {
    await db.badge.upsert({ where: { id: b.id }, create: b, update: {} });
  }

  // COURSE_SPECIFIC badge tied to the seed course (threshold unused).
  await db.badge.upsert({
    where: { id: "seed-badge-course-specific" },
    create: {
      id: "seed-badge-course-specific",
      name: `Lulusan ${course.title}`,
      description: "Selesaikan kursus ini hingga 100% untuk meraih badge.",
      trigger: BadgeTrigger.COURSE_SPECIFIC,
      threshold: 0,
      courseId: course.id,
      logoUrl: "https://placehold.co/128x128/png?text=CS",
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

type SeedCourseInput = {
  slug: string;
  title: string;
  categoryName: string;
  thumbnailUrl: string;
  price: number;
  fakePrice: number;
  estimatedDuration: number;
  shortDescription: string;
  description: string;
  instructor: string;
  instructorBio: string;
  isFeatured?: boolean;
  benefits: string[];
  faqs: { q: string; a: string }[];
  sprints: {
    title: string;
    steps: { title: string; type: StepType; description: string }[];
  }[];
};

/**
 * Upsert a full Course with category, benefits, faqs, sprints, and steps.
 * Idempotent by slug — re-running the seed updates the lightweight fields and
 * leaves children intact (the heavy children are only created on first run).
 */
async function seedCourse(client: PrismaClient, input: SeedCourseInput) {
  const cat = await client.category.upsert({
    where: { name: input.categoryName },
    create: { name: input.categoryName },
    update: {},
  });

  const existing = await client.course.findUnique({ where: { slug: input.slug } });
  if (existing) {
    await client.course.update({
      where: { slug: input.slug },
      data: {
        title: input.title,
        description: input.description,
        shortDescription: input.shortDescription,
        thumbnailUrl: input.thumbnailUrl,
        price: input.price,
        fakePrice: input.fakePrice,
        estimatedDuration: input.estimatedDuration,
        instructor: input.instructor,
        instructorBio: input.instructorBio,
        isFeatured: input.isFeatured ?? false,
      },
    });
    return existing;
  }

  const created = await client.course.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      shortDescription: input.shortDescription,
      categoryId: cat.id,
      thumbnailUrl: input.thumbnailUrl,
      price: input.price,
      fakePrice: input.fakePrice,
      estimatedDuration: input.estimatedDuration,
      instructor: input.instructor,
      instructorBio: input.instructorBio,
      instructorImg: "",
      status: CourseStatus.PUBLISHED,
      isFeatured: input.isFeatured ?? false,
      benefits: {
        create: input.benefits.map((text, i) => ({ text, order: i + 1 })),
      },
      faqs: {
        create: input.faqs.map((f, i) => ({
          question: f.q,
          answer: f.a,
          order: i + 1,
        })),
      },
    },
  });

  for (const [sprintIdx, sprintInput] of input.sprints.entries()) {
    const sprint = await client.sprint.create({
      data: {
        courseId: created.id,
        title: sprintInput.title,
        order: sprintIdx + 1,
      },
    });
    for (const [stepIdx, stepInput] of sprintInput.steps.entries()) {
      await client.step.create({
        data: {
          sprintId: sprint.id,
          title: stepInput.title,
          type: stepInput.type,
          order: stepIdx + 1,
          description: stepInput.description,
        },
      });
    }
  }

  return created;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
