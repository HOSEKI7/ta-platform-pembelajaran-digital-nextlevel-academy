import type { PlayerCourse } from "./types";

/**
 * Mock data for the Course Player frontend iteration. Designed to exercise
 * every status visual on first load: 3 completed → 1 active → 3 locked,
 * including 1 quiz placeholder.
 *
 * When backend wiring lands, this constant goes away and the page will load
 * a `PlayerCourse` from `course-player-loader.ts`.
 */
export const MOCK_COURSES: PlayerCourse[] = [
  {
    id: "course-rest-api-nextjs",
    slug: "membangun-rest-api-modern-dengan-nextjs",
    title: "Membangun REST API Modern dengan Next.js",
    category: "Web Programming",
    instructor: {
      name: "Aulia Pratama",
      role: "Senior Engineer — NextLevel Studio",
      bio: "Membangun sistem berskala besar di Tokopedia dan Gojek. Fokus pada DX, performa, dan arsitektur API yang gampang dirawat oleh tim.",
      avatarInitials: "AP",
    },
    mockCompletedStepIds: ["s1-v1", "s1-v2", "s2-v1"],
    sprints: [
      {
        id: "sprint-1",
        title: "Fondasi",
        order: 1,
        steps: [
          {
            id: "s1-v1",
            title: "Pendahuluan & Tujuan Course",
            type: "VIDEO",
            durationSec: 8 * 60,
            description:
              "Selamat datang! Pada materi pembuka ini, kita akan menyusun peta perjalanan course: dari pemahaman fundamental Next.js App Router, route handler, validasi, sampai akhirnya deploy ke production. Kamu akan tahu apa yang bisa dibawa pulang dari setiap sprint.",
            resources: [
              {
                label: "Slide Pengantar (PDF)",
                href: "#",
                kind: "pdf",
                meta: "1.2 MB",
              },
              {
                label: "Repo GitHub: starter-template",
                href: "#",
                kind: "code",
                meta: "github.com",
              },
            ],
          },
          {
            id: "s1-v2",
            title: "Setup Project & Konvensi Folder",
            type: "VIDEO",
            durationSec: 14 * 60,
            description:
              "Inisialisasi project Next.js 16 dengan Turbopack, atur konvensi folder yang scalable, lalu pasang Prisma + Better Auth supaya kita siap kerja sejak menit pertama. Kita juga setup ESLint + Prettier biar konsisten antar developer.",
            resources: [
              {
                label: "Checklist setup project",
                href: "#",
                kind: "pdf",
                meta: "320 KB",
              },
            ],
          },
        ],
      },
      {
        id: "sprint-2",
        title: "Routing & Handler",
        order: 2,
        steps: [
          {
            id: "s2-v1",
            title: "Route Handlers Dasar",
            type: "VIDEO",
            durationSec: 18 * 60,
            description:
              "Memahami arsitektur Route Handler di Next.js: bagaimana request masuk diproses, perbedaan dengan API Routes lama, dan kenapa file-based routing mempercepat eksperimen. Praktik membuat handler GET dan POST sederhana.",
            resources: [
              {
                label: "Cheatsheet Route Handler",
                href: "#",
                kind: "pdf",
                meta: "780 KB",
              },
              {
                label: "Dokumentasi Resmi Next.js",
                href: "https://nextjs.org/docs",
                kind: "link",
              },
            ],
          },
          {
            id: "s2-v2",
            title: "Dynamic Routes & Nested Segments",
            type: "VIDEO",
            durationSec: 22 * 60,
            description:
              "Mendalami dynamic routes ([id]), catch-all (...slug), dan optional catch-all. Studi kasus: membangun endpoint `/api/courses/:slug/steps/:stepId` yang aman, terstruktur, dan mudah di-test. Kita juga bahas error boundary di level handler.",
            resources: [
              {
                label: "Contoh kode: nested handler",
                href: "#",
                kind: "code",
                meta: "snippet",
              },
            ],
          },
          {
            id: "s2-q1",
            title: "Kuis: Routing & Handler",
            type: "QUIZ",
            durationSec: 5 * 60,
            description:
              "Uji pemahamanmu tentang Route Handler, dynamic segments, dan error handling. Kamu butuh skor ≥ 80 untuk lanjut. Kalau gagal 3 kali, ada cooldown 30 menit sebelum bisa coba lagi — gunakan waktu itu untuk meninjau materi.",
          },
        ],
      },
      {
        id: "sprint-3",
        title: "Validasi & Deploy",
        order: 3,
        steps: [
          {
            id: "s3-v1",
            title: "Validasi Request dengan Zod",
            type: "VIDEO",
            durationSec: 16 * 60,
            description:
              "Tipe runtime yang aman dengan Zod: kita rancang skema sekali, dipakai di client (react-hook-form) dan server (route handler). Bonus: bagaimana memetakan ZodError ke response 400 yang ramah developer.",
          },
          {
            id: "s3-v2",
            title: "Deploy ke Vercel & Env Production",
            type: "VIDEO",
            durationSec: 12 * 60,
            description:
              "Akhir perjalanan: deploy ke Vercel, konfigurasi environment variable, edge runtime vs node runtime, dan checklist sebelum go-live. Kita tutup dengan strategi monitoring sederhana memakai Vercel Analytics.",
            resources: [
              {
                label: "Checklist go-live (PDF)",
                href: "#",
                kind: "pdf",
                meta: "640 KB",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function findCourseBySlug(slug: string): PlayerCourse | undefined {
  return MOCK_COURSES.find((c) => c.slug === slug);
}
