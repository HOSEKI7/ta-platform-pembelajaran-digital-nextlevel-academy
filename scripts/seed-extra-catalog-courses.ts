/**
 * One-off: seed extra catalog courses so the /catalog page has more variety
 * for the target user (Test_farid1 / faridzahran174@gmail.com). These are
 * PUBLISHED courses the user is NOT enrolled in — they should appear in the
 * catalog without the "owned" ribbon.
 *
 * Idempotent: upserts by slug. Re-running will refresh light fields but won't
 * duplicate sprints/steps/benefits/faqs.
 *
 * Run with:  npx tsx scripts/seed-extra-catalog-courses.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { CourseStatus, PrismaClient, StepType } from "../src/generated/prisma";

const TARGET_EMAIL = "faridzahran174@gmail.com";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

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

const EXTRA_COURSES: SeedCourseInput[] = [
  {
    slug: "git-github-dari-nol",
    title: "Belajar Git dan GitHub dari Nol",
    categoryName: "Web Programming",
    thumbnailUrl:
      "https://placehold.co/800x500/0F172A/F4D600/png?text=Git+%26+GitHub",
    price: 159_000,
    fakePrice: 299_000,
    estimatedDuration: 300,
    isFeatured: false,
    shortDescription:
      "Kuasai version control: branching, merging, pull request, dan kolaborasi tim di GitHub.",
    description:
      "Kursus fundamental Git dan GitHub untuk developer di semua level. Mulai dari konsep dasar version control, struktur commit yang baik, branching strategy (Git Flow vs Trunk-Based), resolving merge conflict tanpa panik, hingga workflow kolaborasi tim lewat pull request, code review, dan GitHub Actions sederhana. Materi disusun problem-first — setiap konsep dijelaskan lewat skenario nyata yang sering dijumpai di tim engineering.",
    instructor: "Reza Mahendra",
    instructorBio:
      "Engineering manager dengan 9 tahun pengalaman memimpin tim backend di fintech dan e-commerce nasional. Membangun workflow Git internal untuk tim 30+ developer. Pendukung kuat \"commit yang berbicara\" — pesan commit yang menjelaskan kenapa, bukan apa.",
    benefits: [
      "Memahami konsep version control dan kapan Git digunakan",
      "Workflow harian: stage, commit, push, pull, branch",
      "Resolving merge conflict tanpa stress",
      "Kolaborasi tim lewat pull request dan code review",
    ],
    faqs: [
      {
        q: "Perlu pengalaman coding sebelumnya?",
        a: "Tidak wajib, tapi disarankan minimal pernah menulis satu skrip kecil (HTML/Python/apa pun). Materi fokus pada konsep, bukan bahasa.",
      },
      {
        q: "OS apa yang dipakai?",
        a: "Windows, macOS, atau Linux — semua sama. Kita pakai Git CLI dengan demo singkat di GUI (VS Code / GitHub Desktop).",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Fondasi Git",
        steps: [
          {
            title: "Konsep version control",
            type: StepType.VIDEO,
            description:
              "Kenapa Git ada, masalah apa yang ia selesaikan, dan kenapa folder \"final_v2_revisi_FIX.zip\" bukan jawaban.",
          },
          {
            title: "Init, add, commit",
            type: StepType.VIDEO,
            description:
              "Alur dasar: dari working directory → staging area → commit. Anatomi sebuah commit dan kenapa pesan commit penting.",
          },
          {
            title: "Kuis: Konsep dan Alur Dasar",
            type: StepType.QUIZ,
            description:
              "Validasi pemahaman istilah staging area, working tree, dan repository sebelum lanjut ke branching.",
          },
        ],
      },
      {
        title: "Sprint 2: Branching & Kolaborasi",
        steps: [
          {
            title: "Branch, merge, rebase",
            type: StepType.VIDEO,
            description:
              "Membuat branch fitur, menggabungkan dengan merge vs rebase, dan kapan masing-masing strategi cocok dipakai.",
          },
          {
            title: "Pull request & code review",
            type: StepType.VIDEO,
            description:
              "Workflow GitHub: fork (opsional), push, buka PR, request review, dan etika berkomentar di PR teman.",
          },
        ],
      },
    ],
  },
  {
    slug: "javascript-modern-es6-pemula",
    title: "JavaScript Modern: ES6+ untuk Pemula",
    categoryName: "Web Programming",
    thumbnailUrl:
      "https://placehold.co/800x500/F7DF1E/0F172A/png?text=JavaScript+ES6%2B",
    price: 229_000,
    fakePrice: 399_000,
    estimatedDuration: 450,
    isFeatured: true,
    shortDescription:
      "Dari sintaks dasar hingga fitur modern: let/const, arrow function, destructuring, async/await.",
    description:
      "Kursus JavaScript komprehensif untuk pemula yang sudah pernah menyentuh HTML/CSS. Materi disusun mengikuti standar ECMAScript modern (ES2015+): variabel dengan let/const, arrow function, template literal, destructuring, spread/rest, modul ES, Promise, dan async/await. Diakhiri dengan project mini: kalkulator cicilan dan to-do list dengan localStorage.",
    instructor: "Nadia Pertiwi",
    instructorBio:
      "Frontend engineer dengan 6 tahun pengalaman di startup edtech dan SaaS B2B. Mentor di program bootcamp lokal selama 3 tahun, fokus mengajar pemula yang takut error message. Pendekatannya: \"baca error, jangan paranoid\".",
    benefits: [
      "Sintaks ES6+ yang dipakai di dunia kerja",
      "Bekerja dengan array dan object secara idiomatic",
      "Memahami Promise dan async/await",
      "Project: kalkulator dan to-do list dengan localStorage",
    ],
    faqs: [
      {
        q: "Apakah ini bisa langsung lanjut ke React?",
        a: "Bisa. Setelah selesai, kamu siap belajar framework apa pun (React, Vue, Svelte). Sintaks modern yang dibahas adalah fondasi yang dipakai semua framework.",
      },
      {
        q: "Editor apa yang dipakai?",
        a: "VS Code dengan ekstensi standar. Semua latihan bisa juga dijalankan langsung di console browser.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Sintaks Modern",
        steps: [
          {
            title: "let, const, dan scope",
            type: StepType.VIDEO,
            description:
              "Perbedaan var, let, const, kapan masing-masing dipakai, serta konsep block scope dan hoisting tanpa membuat pusing.",
          },
          {
            title: "Arrow function & template literal",
            type: StepType.VIDEO,
            description:
              "Sintaks ringkas fungsi modern dan string interpolasi yang membuat kode lebih readable.",
          },
        ],
      },
      {
        title: "Sprint 2: Array, Object, & Async",
        steps: [
          {
            title: "Destructuring & spread/rest",
            type: StepType.VIDEO,
            description:
              "Pola ambil-nilai dari object/array yang dipakai di hampir semua codebase modern, plus operator ... untuk copy dan combine.",
          },
          {
            title: "Promise & async/await",
            type: StepType.VIDEO,
            description:
              "Konsep operasi asynchronous, kenapa callback hell terjadi, dan bagaimana async/await menyelesaikannya.",
          },
          {
            title: "Kuis: ES6+ Essentials",
            type: StepType.QUIZ,
            description:
              "Validasi pemahaman sintaks modern dan konsep async sebelum project akhir.",
          },
        ],
      },
    ],
  },
  {
    slug: "devops-docker-github-actions",
    title: "DevOps Fundamental: Docker & GitHub Actions",
    categoryName: "DevOps",
    thumbnailUrl:
      "https://placehold.co/800x500/2496ED/ffffff/png?text=Docker+%2B+CI%2FCD",
    price: 379_000,
    fakePrice: 649_000,
    estimatedDuration: 540,
    isFeatured: true,
    shortDescription:
      "Kemas aplikasi dengan Docker, otomatisasi build & deploy dengan GitHub Actions.",
    description:
      "Pengenalan praktis DevOps untuk developer yang ingin lebih mandiri merilis aplikasi. Mencakup konsep container vs virtual machine, menulis Dockerfile yang efisien, multi-stage build untuk image kecil, Docker Compose untuk stack lokal, lalu pipeline CI/CD dengan GitHub Actions: lint → test → build image → deploy ke environment staging. Studi kasus deploy aplikasi Node.js dan Next.js ke VPS dengan Nginx reverse proxy.",
    instructor: "Yoga Mahardika",
    instructorBio:
      "Platform engineer dengan 8 tahun pengalaman membangun infrastruktur untuk aplikasi traffic menengah-tinggi. Sebelumnya SRE di telco, sekarang konsultan independen untuk tim engineering yang transisi ke cloud-native. Pendukung kuat \"otomatisasi yang membosankan\".",
    benefits: [
      "Menulis Dockerfile yang efisien dan aman",
      "Stack lokal dengan Docker Compose (app + db + cache)",
      "Pipeline CI/CD GitHub Actions: test → build → deploy",
      "Deploy ke VPS dengan Nginx reverse proxy",
    ],
    faqs: [
      {
        q: "Perlu akun cloud berbayar?",
        a: "Tidak wajib. Semua latihan bisa dijalankan di lokal dengan Docker Desktop. Untuk modul deploy ke VPS, kita pakai tier gratis yang bisa dihapus setelah selesai.",
      },
      {
        q: "Cocok untuk backend atau frontend developer?",
        a: "Keduanya. Studi kasus mencakup aplikasi Node.js (backend) dan Next.js (fullstack). Konsep container relevan untuk semua bahasa.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Docker Fundamental",
        steps: [
          {
            title: "Container vs VM",
            type: StepType.VIDEO,
            description:
              "Konsep dasar isolasi proses, image vs container, dan kenapa Docker mengubah cara aplikasi dirilis.",
          },
          {
            title: "Dockerfile yang baik",
            type: StepType.VIDEO,
            description:
              "Layer caching, multi-stage build, .dockerignore, dan trik kecil untuk image kurang dari 200MB.",
          },
          {
            title: "Docker Compose",
            type: StepType.VIDEO,
            description:
              "Menjalankan stack lokal app + database + cache hanya dengan satu file dan satu perintah.",
          },
        ],
      },
      {
        title: "Sprint 2: CI/CD dengan GitHub Actions",
        steps: [
          {
            title: "Workflow pertama",
            type: StepType.VIDEO,
            description:
              "Anatomi file workflow YAML, trigger event (push, PR, schedule), dan secret management.",
          },
          {
            title: "Pipeline lint → test → build → deploy",
            type: StepType.VIDEO,
            description:
              "Menyusun pipeline lengkap, push image ke registry, dan SSH deploy ke VPS dengan zero-downtime sederhana.",
          },
          {
            title: "Kuis: Docker & CI/CD",
            type: StepType.QUIZ,
            description:
              "Memvalidasi pemahaman konsep image, container, dan langkah-langkah pipeline CI/CD.",
          },
        ],
      },
    ],
  },
  {
    slug: "cybersecurity-dasar-it",
    title: "Cybersecurity Dasar untuk Profesional IT",
    categoryName: "Cybersecurity",
    thumbnailUrl:
      "https://placehold.co/800x500/DC2626/ffffff/png?text=Cybersecurity+101",
    price: 299_000,
    fakePrice: 499_000,
    estimatedDuration: 420,
    isFeatured: false,
    shortDescription:
      "Pahami ancaman siber paling umum dan cara mempertahankan aplikasi serta data perusahaan.",
    description:
      "Kursus pengenalan keamanan siber untuk developer, sysadmin, dan profesional IT. Mencakup model ancaman (threat modeling), OWASP Top 10 dengan contoh kasus nyata, prinsip least privilege, dasar kriptografi terapan (hashing, simetris, asimetris, TLS), keamanan email & phishing, hingga incident response sederhana. Bukan kursus pentest — fokusnya defensif: bagaimana mendesain dan mengoperasikan sistem yang sulit ditembus.",
    instructor: "Putri Anggraini",
    instructorBio:
      "Security engineer dengan 7 tahun pengalaman di tim AppSec perbankan dan startup keuangan. Sertifikasi OSCP dan CISSP. Sering menjadi pembicara di komunitas Honeynet ID. Pendekatannya pragmatis: \"keamanan 80% adalah disiplin, 20% tools\".",
    benefits: [
      "Mengidentifikasi ancaman umum lewat threat modeling sederhana",
      "Memahami OWASP Top 10 dan cara mitigasinya",
      "Dasar kriptografi terapan untuk developer",
      "Incident response: apa yang harus dilakukan dalam 24 jam pertama",
    ],
    faqs: [
      {
        q: "Apakah ini kursus hacking?",
        a: "Bukan. Fokus kursus adalah defensif (blue team) — bagaimana melindungi sistem. Kita membahas teknik serangan hanya sebatas memahami bagaimana sistem bocor.",
      },
      {
        q: "Perlu background coding?",
        a: "Sangat membantu, terutama untuk modul OWASP. Tapi konsep umum (threat modeling, kriptografi, incident response) bisa diikuti tanpa pengalaman coding intensif.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Mindset & Threat Modeling",
        steps: [
          {
            title: "Pola pikir keamanan",
            type: StepType.VIDEO,
            description:
              "Kenapa keamanan adalah trade-off, prinsip defense in depth, dan bagaimana berpikir seperti penyerang tanpa menjadi penyerang.",
          },
          {
            title: "Threat modeling STRIDE",
            type: StepType.VIDEO,
            description:
              "Memetakan ancaman untuk satu fitur (mis. login form) menggunakan kerangka STRIDE — Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation.",
          },
        ],
      },
      {
        title: "Sprint 2: OWASP & Mitigasi",
        steps: [
          {
            title: "OWASP Top 10 — bagian 1",
            type: StepType.VIDEO,
            description:
              "Injection, broken auth, dan sensitive data exposure dengan demo singkat di aplikasi yang sengaja rentan.",
          },
          {
            title: "OWASP Top 10 — bagian 2",
            type: StepType.VIDEO,
            description:
              "XSS, deserialization, dan SSRF: bagaimana terjadi dan pola mitigasi standar di framework modern.",
          },
          {
            title: "Kuis: OWASP & Threat Modeling",
            type: StepType.QUIZ,
            description:
              "Memvalidasi pemahaman ancaman umum dan kerangka analisis sebelum lanjut ke topik incident response.",
          },
        ],
      },
    ],
  },
  {
    slug: "english-for-it-professionals",
    title: "English for IT Professionals",
    categoryName: "Soft Skill",
    thumbnailUrl:
      "https://placehold.co/800x500/0EA5E9/ffffff/png?text=English+for+IT",
    price: 179_000,
    fakePrice: 349_000,
    estimatedDuration: 360,
    isFeatured: false,
    shortDescription:
      "Komunikasi profesional dalam Bahasa Inggris: email, meeting, dokumentasi, dan code review.",
    description:
      "Kursus Bahasa Inggris terapan untuk profesional IT yang sering berinteraksi dengan tim global. Tidak fokus pada grammar dari nol — kursus ini memilih topik dengan dampak tinggi: menulis email yang ringkas, memimpin meeting standup, menulis dokumentasi teknis yang jelas, memberi feedback di code review tanpa terdengar agresif, hingga teknik public speaking untuk presentasi teknis. Cocok untuk yang sudah punya dasar Bahasa Inggris pasif (CEFR A2+) dan ingin meningkatkan kepercayaan diri komunikasi aktif.",
    instructor: "Michael Tanjaya",
    instructorBio:
      "Technical writer dan komunikasi-coach untuk tim engineering di perusahaan multinasional. Sebelumnya software engineer selama 5 tahun, lalu transisi ke developer relations. Mengelola program internal pelatihan Bahasa Inggris di dua perusahaan teknologi besar di Indonesia.",
    benefits: [
      "Menulis email profesional yang ringkas dan jelas",
      "Memimpin dan mengikuti meeting standup dengan percaya diri",
      "Menulis dokumentasi teknis yang dipahami non-native speaker",
      "Memberi feedback di code review dengan diplomatis",
    ],
    faqs: [
      {
        q: "Tingkat Bahasa Inggris minimal?",
        a: "CEFR A2 ke atas — bisa membaca artikel teknis dasar dan menulis kalimat sederhana. Kursus ini bukan untuk pemula total.",
      },
      {
        q: "Apakah ada sesi live speaking?",
        a: "Belum di edisi ini. Materi disampaikan via video + transkrip + latihan tulisan. Edisi mendatang akan menambah modul live coaching.",
      },
    ],
    sprints: [
      {
        title: "Sprint 1: Written Communication",
        steps: [
          {
            title: "Professional email writing",
            type: StepType.VIDEO,
            description:
              "Struktur email: subject yang jelas, pembuka, isi singkat, call-to-action, dan penutup. Template umum: minta review, follow-up, eskalasi.",
          },
          {
            title: "Technical documentation",
            type: StepType.VIDEO,
            description:
              "Prinsip dokumentasi yang baik: audience-first, contoh konkret, dan kenapa README sering dibaca duluan oleh pengguna baru.",
          },
        ],
      },
      {
        title: "Sprint 2: Verbal & Collaborative",
        steps: [
          {
            title: "Standup & meeting",
            type: StepType.VIDEO,
            description:
              "Format standup tiga-pertanyaan, cara intervensi sopan saat tidak setuju, dan frasa-frasa siap pakai untuk meeting.",
          },
          {
            title: "Diplomatic code review",
            type: StepType.VIDEO,
            description:
              "Bedanya \"This is wrong\" vs \"I wonder if we could…\". Pola bahasa untuk memberi feedback yang membantu tanpa menyinggung.",
          },
          {
            title: "Kuis: Komunikasi Profesional",
            type: StepType.QUIZ,
            description:
              "Memvalidasi pemahaman pola bahasa profesional dalam email, dokumentasi, dan code review.",
          },
        ],
      },
    ],
  },
];

async function seedCourse(client: PrismaClient, input: SeedCourseInput) {
  const cat = await client.category.upsert({
    where: { name: input.categoryName },
    create: { name: input.categoryName },
    update: {},
  });

  const existing = await client.course.findUnique({
    where: { slug: input.slug },
  });
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
    return { id: existing.id, created: false };
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

  return { id: created.id, created: true };
}

async function main() {
  const user = await db.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      enrollments: { select: { courseId: true } },
    },
  });
  if (!user) {
    throw new Error(
      `No user found with email "${TARGET_EMAIL}". Sign up first, then re-run.`,
    );
  }
  console.log(
    `Target user: ${user.name} <${user.email}>${
      user.username ? ` (@${user.username})` : ""
    }`,
  );
  console.log(`Existing enrollments: ${user.enrollments.length}`);

  const ownedSet = new Set(user.enrollments.map((e) => e.courseId));

  let createdCount = 0;
  let refreshedCount = 0;
  let alreadyOwnedCount = 0;

  for (const input of EXTRA_COURSES) {
    const result = await seedCourse(db, input);
    if (result.created) {
      console.log(`  created  ${input.slug.padEnd(34)}  ${input.title}`);
      createdCount++;
    } else {
      console.log(`  refreshed ${input.slug.padEnd(33)}  ${input.title}`);
      refreshedCount++;
    }
    if (ownedSet.has(result.id)) {
      alreadyOwnedCount++;
    }
  }

  console.log(
    `\nDone. created=${createdCount} refreshed=${refreshedCount} (${alreadyOwnedCount} of these are already enrolled — by design, these courses should be unowned for ${TARGET_EMAIL}).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
