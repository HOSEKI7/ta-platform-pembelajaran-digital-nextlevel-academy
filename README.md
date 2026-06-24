<div align="center">
  <img src="/assets/LogoFit.png" height="85" alt="NextLevel Academy Logo">
  <h1>NextLevel Academy</h1>
  <p>Platform Pembelajaran Digital dengan Gamifikasi & Sistem Magang Terintegrasi</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000000?logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript%205-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Prisma%207-2D3748?logo=prisma&logoColor=white" alt="Prisma 7">
  <img src="https://img.shields.io/badge/Tailwind%20v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind v4">
  <img src="https://img.shields.io/badge/Better%20Auth-8B5CF6" alt="Better Auth">
  <img src="https://img.shields.io/badge/Midtrans-0088CC" alt="Midtrans">
</p>

---

## Daftar Isi

- [Daftar Isi](#daftar-isi)
- [Tentang](#tentang)
- [Fitur Berdasarkan Role](#fitur-berdasarkan-role)
  - [🎓 Peserta Didik](#-peserta-didik)
  - [📋 Peserta Magang](#-peserta-magang)
  - [👨‍🏫 Mentor](#-mentor)
  - [🔧 Administrator](#-administrator)
- [Tech Stack](#tech-stack)
- [Screenshot](#screenshot)
  - [Landing Page](#landing-page)
  - [Halaman Auth](#halaman-auth)
  - [Dashboard Peserta Didik](#dashboard-peserta-didik)
  - [Course Player](#course-player)
- [Prasyarat](#prasyarat)
- [Panduan Instalasi](#panduan-instalasi)
  - [1. Clone repositori](#1-clone-repositori)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Siapkan environment variables](#3-siapkan-environment-variables)
  - [4. Push schema ke database](#4-push-schema-ke-database)
  - [5. (Opsional) Seed data awal](#5-opsional-seed-data-awal)
  - [6. Bootstrap akun admin pertama](#6-bootstrap-akun-admin-pertama)
  - [7. Jalankan development server](#7-jalankan-development-server)
- [Scripts yang Tersedia](#scripts-yang-tersedia)
- [Struktur Proyek](#struktur-proyek)
- [Akun Testing](#akun-testing)
- [Deployment](#deployment)
- [Catatan Skripsi](#catatan-skripsi)

---

## Tentang

NextLevel Academy adalah platform pembelajaran digital berbasis web yang menargetkan pasar Indonesia. Platform ini menyediakan kursus berbayar dengan model **one-time purchase, lifetime access** — tanpa langganan berulang.

Pendekatan **gamifikasi** (EXP, leveling, badge, voucher reward) dirancang untuk meningkatkan retensi dan motivasi belajar. Platform juga mengintegrasikan **sistem magang daring (internship)** yang mencakup absensi, manajemen tugas, dan penilaian akhir — semuanya dalam satu ekosistem.

**Empat role pengguna:**

| Role               | Cara Mendapatkan Akun | Deskripsi                                                              |
| ------------------ | --------------------- | ---------------------------------------------------------------------- |
| **Peserta Didik**  | Registrasi mandiri    | Membeli dan mengakses kursus, mendapatkan EXP/badge/sertifikat         |
| **Peserta Magang** | Dibuat Admin          | Absensi harian, tugas dari mentor, nilai akhir magang                  |
| **Mentor**         | Dibuat Admin          | Membimbing peserta magang, memberi tugas & feedback, input nilai akhir |
| **Administrator**  | Pre-seeded / Invite   | Kelola seluruh platform: konten, pengguna, transaksi, konfigurasi      |

Bahasa UI: **Indonesia** · Mata uang: **IDR** · Zona waktu: **WIB (UTC+7)** · Format tanggal: **DD/MM/YYYY**

> 📖 Spesifikasi lengkap: [`docs/NextLevel_Academy_PRD_v2.md`](docs/NextLevel_Academy_PRD_v2.md)

---

## Fitur Berdasarkan Role

### 🎓 Peserta Didik

- Katalog kursus dengan search & filter kategori
- Checkout via Midtrans Snap (QRIS, VA, Retail, dll.)
- Course player: video (Bunny.net) + quiz pilihan ganda
- Catatan pribadi per-step (autosave, DB-backed)
- Sistem EXP & leveling (`REQ(L) = 744 + 124 × (L-1)`)
- Badge (Beginner / Explorer / Scholar / Master)
- Voucher reward otomatis di level 5, 10, 15
- Sertifikat digital (Satori PNG + PDF wrapper)
- Riwayat transaksi & invoice (PNG export)

### 📋 Peserta Magang

- Dashboard ringkasan aktivitas magang
- Absensi harian (check-in WIB, riwayat kalender)
- Daftar tugas dari mentor + upload/submit tugas
- Nilai akhir magang
- Notifikasi in-app (tugas baru, feedback, nilai)

### 👨‍🏫 Mentor

- Dashboard dengan ringkasan kelas bimbingan
- Absensi pribadi (check-in harian)
- Daftar peserta (read-only)
- Pantau absensi peserta (read-only)
- CRUD tugas + feedback pengembalian
- Input nilai akhir peserta (0–100)
- Notifikasi in-app (submit tugas, override nilai)

### 🔧 Administrator

- Dashboard analitik (pendapatan, pengguna, kursus)
- Manajemen kursus: CRUD + kurikulum (sprint/step/video/quiz)
- Manajemen kategori kursus
- Manajemen pengguna (4 role) + soft delete
- Manajemen transaksi: terima/tolak/hapus
- Manajemen voucher diskon (% dan nominal tetap)
- Manajemen sertifikat (monitoring, konfigurasi expiry)
- Manajemen badge (CRUD, ikon preset/upload)
- Manajemen program magang (batch/bidang/kelas, absensi, tugas, nilai akhir, holiday)
- Konfigurasi platform (profil, keamanan, info platform, status integrasi)
- Invite akun admin via email
- Audit log seluruh aktivitas

---

## Tech Stack

| Kategori         | Teknologi                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router) + Turbopack + React 19                         |
| **Bahasa**       | TypeScript 5                                                           |
| **Styling**      | Tailwind CSS v4 (PostCSS plugin) + shadcn/ui (base-ui)                 |
| **Database**     | PostgreSQL (Supabase) + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| **Auth**         | Better Auth 1.6 (email/password, session cookie, rate-limit)           |
| **Server State** | TanStack Query 5                                                       |
| **Payment**      | Midtrans Snap (QRIS, VA, Retail, Akulaku, dll.)                        |
| **Video**        | Bunny.net Stream (TUS upload, signed iframe embed)                     |
| **File Storage** | Bunny.net Storage (task attachments, thumbnails, badge icons)          |
| **Certificate**  | Satori + Sharp (PNG) + pdf-lib (PDF wrapper)                           |
| **Email**        | Resend + React Email templates                                         |
| **Validation**   | Zod 4 + react-hook-form + `@hookform/resolvers`                        |
| **Rich Text**    | Tiptap (deskripsi kursus, tugas)                                       |
| **Charts**       | Recharts (admin dashboard)                                             |
| **PDF Invoice**  | html-to-image (PNG export)                                             |
| **Testing**      | Playwright (E2E)                                                       |
| **Rate Limit**   | rate-limiter-flexible + Redis (opsional)                               |

---

## Screenshot

#### Landing Page

![Landing Page](/assets/LandingPage.png)

#### Halaman Auth

![Login Page](/assets/LoginPage.png)

#### Dashboard Peserta Didik

![Dashboard Peserta Didik](/assets/Dashboard_PesertaDidik.png)

#### Course Player

![Video Learning](/assets/LearningPage_Video_PesertaDidik.png)

---

## Prasyarat

- **Node.js** 20.x atau lebih baru
- **PostgreSQL** 15+ — direkomendasikan menggunakan **Supabase** (free tier cukup)
- **Akun Bunny.net** — untuk video streaming (Stream) dan file storage
- **Akun Midtrans** — untuk payment gateway (sandbox untuk development)
- **Akun Resend** — untuk pengiriman email transaksional (domain terverifikasi untuk produksi)
- **Redis** (opsional) — untuk rate-limit persistence; docker-compose tersedia

---

## Panduan Instalasi

### 1. Clone repositori

```bash
git clone <repository-url>
cd platform-pembelajaran-digital-nextlevel-academy
```

### 2. Install dependencies

```bash
npm install
```

`postinstall` akan otomatis menjalankan `prisma generate`. Jika tidak, jalankan manual:

```bash
npx prisma generate
```

### 3. Siapkan environment variables

```bash
cp .env.example .env.local
```

Isi semua variabel yang dibutuhkan di `.env.local`. Lihat [.env.example](.env.example) untuk dokumentasi tiap variabel.

### 4. Push schema ke database

```bash
npx prisma db push
```

### 5. (Opsional) Seed data awal

```bash
npm run db:seed
```

Seed ini membuat data awal: kategori, course contoh, pengguna default, dll.

### 6. Bootstrap akun admin pertama

```bash
npm run bootstrap:admin
```

Membuat akun Administrator dari env `BOOTSTRAP_ADMIN_EMAIL` (akan diminta ganti password saat login pertama).

### 7. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Scripts yang Tersedia

| Script                    | Deskripsi                                   |
| ------------------------- | ------------------------------------------- |
| `npm run dev`             | Jalankan development server (Turbopack)     |
| `npm run build`           | Build produksi                              |
| `npm run start`           | Serve hasil build                           |
| `npm run lint`            | ESLint check                                |
| `npm run typecheck`       | TypeScript check (`tsc --noEmit`)           |
| `npm run db:generate`     | Regenerate Prisma client                    |
| `npm run db:push`         | Push schema ke DB (session-mode)            |
| `npm run db:studio`       | Buka Prisma Studio GUI                      |
| `npm run db:seed`         | Seed data awal platform                     |
| `npm run db:seed:player`  | Seed data test course player                |
| `npm run db:verify`       | Verifikasi koneksi & schema DB              |
| `npm run reset:data`      | Reset semua data (kecuali platform_setting) |
| `npm run bootstrap:admin` | Bootstrap akun admin pertama                |
| `npm run verify:bunny`    | Diagnostik konektivitas Bunny.net           |
| `npm run test:e2e`        | Jalankan Playwright E2E tests               |
| `npm run clean`           | Bersihkan `.next` cache                     |

---

## Struktur Proyek

```
src/
├── app/
│   ├── (public)/          # Landing, katalog, detail kursus, /contact, /about
│   ├── (auth)/            # Login, register, forgot/reset password
│   ├── (student)/         # Dashboard, my-courses, /learn, sertifikat, EXP, transaksi
│   ├── (internship)/      # Dashboard, absensi, tugas, nilai akhir magang
│   ├── (mentor)/          # Dashboard, absensi, peserta, tugas, nilai akhir
│   ├── (admin)/           # Dashboard, courses, users, transaksi, vouchers, dll.
│   ├── (checkout)/        # Checkout flow
│   ├── (player)/          # Course player (video/quiz)
│   └── api/               # Route handlers (REST API)
├── components/            # Shared UI components
│   └── ui/                # shadcn/ui components
├── emails/                # React Email templates
├── hooks/                 # Custom React hooks (TanStack Query, dll.)
├── lib/                   # Utilities, helpers, loaders, validations
│   ├── validations/       # Zod schemas (shared client + server)
│   ├── payment/           # Midtrans integration, order fulfillment
│   ├── course-player/     # Course player hooks & loader
│   └── certificates/      # Satori renderer, fonts, upload
├── types/                 # TypeScript declarations
└── proxy.ts               # Next.js 16 middleware (session cookie check)

prisma/
├── schema.prisma          # Data model (source of truth: PRD §9)
└── seed.ts                # Seed data

scripts/                   # One-off utility scripts
docs/
├── NextLevel_Academy_PRD_v2.md   # Product Requirements Document
└── deployment/                    # Deployment guide (00–08)
```

**Routing convention:** Next.js 16 App Router dengan route groups per role. Setiap grup memiliki layout + sidebar sendiri. Proteksi role dilakukan server-side di layout via `requireRole()`.

---

## Akun Testing

Berikut akun untuk development (password ada di skrip seed atau dapat di-reset via Admin Panel):

| Role               | Email                             |
| ------------------ | --------------------------------- |
| **Peserta Didik**  | `faridzahran174@gmail.com`        |
| **Peserta Magang** | `faridzahran174+magang@gmail.com` |
| **Mentor**         | `faridzahran174+mentor@gmail.com` |
| **Administrator**  | `faridzahran174+admin@gmail.com`  |

> Detail password lengkap ada di [`AGENTS.md`](AGENTS.md). Untuk admin, jalankan `npm run bootstrap:admin` untuk membuat akun dari env.

---

## Deployment

Panduan deployment lengkap ada di [`docs/deployment/00-overview.md`](docs/deployment/00-overview.md).

**Arsitektur target:**

- Build di GitHub Actions → artifact standalone Next.js
- Deploy ke VPS (Ubuntu) dengan PM2 + reverse proxy Nginx
- SSL via Certbot (Let's Encrypt)
- Database: Supabase PostgreSQL (production project)
- Redis untuk rate-limit persistence (apt install)
- Backup: `pg_dump` harian via cron

Build standalone diaktifkan via env `BUILD_STANDALONE=1` (hanya di CI).

---

## Catatan Skripsi

Repositori ini dikembangkan sebagai bagian dari **Tugas Akhir / Skripsi** dengan judul:

> **"PENGEMBANGAN PLATFORM PEMBELAJARAN DIGITAL BERBASIS WEB DENGAN GAMIFIKASI DAN SISTEM MAGANG TERINTEGARASI (STUDI KASUS: NEXTLEVEL ACADEMY)"**

Dokumentasi pendukung skripsi dan panduan teknis tambahan tersedia di direktori `docs/`.

---

<p align="center">
  <sub>Dibangun dengan Next.js 16, Prisma 7, dan TypeScript 5</sub>
  <br>
  <sub>© 2026 NextLevel Academy</sub>
</p>
