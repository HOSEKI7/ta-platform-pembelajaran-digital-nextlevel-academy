# Product Requirements Document (PRD)

## NextLevel Academy

**Version:** 1.1.0  
**Status:** Final — Ready for Development  
**Last Updated:** 2025 (Tech Stack Revision)  
**Document Owner:** Product Manager  
**Target Release:** v1.0 (Full Release)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Information Architecture](#5-information-architecture)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 Authentication & Account Management
   - 6.2 Landing Page
   - 6.3 Course Catalog & Detail
   - 6.4 Purchase & Payment
   - 6.5 Learning Page & Course Player
   - 6.6 Certificate System
   - 6.7 Gamification System
   - 6.8 Voucher System
   - 6.9 Internship System (Magang)
   - 6.10 Notification System
   - 6.11 Admin Panel
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Tech Stack & Architecture](#8-tech-stack--architecture)
9. [Data Models](#9-data-models)
10. [API Structure Overview](#10-api-structure-overview)
11. [Security Requirements](#11-security-requirements)
12. [UI/UX Design Guidelines](#12-uiux-design-guidelines)
13. [Email Notification Templates](#13-email-notification-templates)
14. [Constraints & Decisions Log](#14-constraints--decisions-log)
15. [Out of Scope](#15-out-of-scope)
16. [Glossary](#16-glossary)

---

## 1. Executive Summary

NextLevel Academy adalah platform pembelajaran digital berbasis website yang menargetkan pasar Indonesia. Platform ini menyediakan kursus berbayar (one-time purchase, lifetime access) dengan pendekatan gamifikasi — sistem leveling, EXP, badge, dan voucher reward — yang dirancang untuk meningkatkan retensi dan motivasi belajar pengguna.

Selain ekosistem pembelajaran mandiri, platform ini mengintegrasikan **sistem magang daring (internship)** yang memungkinkan pengelolaan peserta magang dan mentor dalam satu platform yang sama.

Platform ini dirancang sebagai produk SaaS internal yang dikelola sepenuhnya oleh tim Administrator, dengan arsitektur yang scalable untuk pertumbuhan jangka panjang.

**Scope v1.0:** Seluruh fitur yang didefinisikan dalam dokumen ini adalah bagian dari rilis pertama dan harus tersedia pada saat platform diluncurkan.

---

## 2. Product Overview

### 2.1 Product Vision

> Menjadi platform pembelajaran digital terpercaya di Indonesia yang membuat pengalaman belajar terasa progresif, terukur, dan menyenangkan melalui pendekatan gamifikasi yang unik.

### 2.2 Product Positioning

| Aspek              | Detail                                                   |
| ------------------ | -------------------------------------------------------- |
| **Kategori**       | E-Learning Platform                                      |
| **Model Bisnis**   | One-time purchase per kursus (no subscription)           |
| **Target Market**  | Pasar Indonesia                                          |
| **Bahasa UI**      | Bahasa Indonesia                                         |
| **Format Tanggal** | DD/MM/YYYY                                               |
| **Mata Uang**      | IDR (Rupiah)                                             |
| **Pembanding**     | Udemy — dengan gamifikasi dan sistem magang terintegrasi |

### 2.3 User Roles

| Role               | Cara Mendapatkan Akun | Deskripsi                                                                             |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------- |
| **Peserta Didik**  | Registrasi mandiri    | Pengguna umum yang membeli dan mengakses kursus                                       |
| **Peserta Magang** | Dibuat oleh Admin     | Peserta magang daring dengan fitur absensi, tugas, dan nilai akhir                    |
| **Mentor**         | Dibuat oleh Admin     | Pembimbing peserta magang; menilai tugas dan memberikan feedback, mengisi nilai akhir |
| **Administrator**  | Sistem / pre-seeded   | Pengelola seluruh platform dengan akses penuh                                         |

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

- Membangun revenue stream dari penjualan kursus berbayar.
- Meningkatkan retensi pengguna melalui sistem gamifikasi.
- Memfasilitasi program magang daring secara terstruktur dan efisien.

### 3.2 Product Goals

- Pengguna dapat membeli dan mengakses kursus tanpa friction.
- Pengguna termotivasi untuk menyelesaikan kursus melalui mekanisme EXP, leveling, dan badge.
- Admin dapat mengelola seluruh operasional platform secara mandiri tanpa ketergantungan teknis.
- Mentor dapat membimbing peserta magang secara efektif dalam satu platform.

### 3.3 Key Performance Indicators (KPIs)

| KPI                          | Target Awal              |
| ---------------------------- | ------------------------ |
| Course completion rate       | ≥ 40%                    |
| Payment success rate         | ≥ 95%                    |
| Page load time (LCP)         | < 2.5 detik              |
| Mobile traffic support       | 100% responsif           |
| Certificate claim rate       | ≥ 60% dari yang complete |
| Zero double-charge incidents | 100%                     |

---

## 4. User Personas

### 4.1 Peserta Didik — "Rafi, 22 tahun"

- Mahasiswa/fresh graduate yang ingin meningkatkan skill digital.
- Akses platform dari HP dan laptop.
- Termotivasi oleh pencapaian visual (badge, level, sertifikat).
- Ingin belajar dengan pace sendiri tanpa terikat jadwal.

**Pain points:** Bosan dengan materi text-heavy; butuh feedback instan; ingin bukti kompetensi yang bisa dibagikan.

### 4.2 Peserta Magang — "Siti, 20 tahun"

- Mahasiswa yang sedang menjalani program magang daring.
- Butuh sistem absensi dan pengumpulan tugas yang jelas dan mudah diakses dari HP.
- Ingin tahu progress dan nilai magang secara transparan.

**Pain points:** Proses absensi dan pengumpulan tugas yang tidak terorganisir; tidak tahu status tugas sudah dinilai atau belum.

### 4.3 Mentor — "Pak Budi, 35 tahun"

- Profesional industri yang membimbing peserta magang paruh waktu.
- Butuh tools sederhana untuk distribusi tugas dan cek hasil kerja peserta.
- Tidak terlalu tech-savvy; UI harus intuitif.

**Pain points:** Sulit memantau banyak peserta sekaligus; feedback bolak-balik via chat tidak terstruktur.

### 4.4 Administrator — "Tim Internal NextLevel"

- Mengelola seluruh konten, pengguna, transaksi, dan konfigurasi platform.
- Membutuhkan dashboard analitik yang informatif untuk pengambilan keputusan.
- Harus bisa melakukan seluruh operasional tanpa bantuan developer.

---

## 5. Information Architecture

### 5.1 Struktur Halaman — Public (Landing Page)

```
/ (Beranda)
├── /courses (Katalog Kursus)
│   └── /courses/:slug (Detail Kursus)
├── /about
├── /contact
├── /verify/:certificateId (Verifikasi Sertifikat — Publik)
└── /login | /register | /forgot-password | /reset-password
```

### 5.2 Struktur Halaman — Learning App (Peserta Didik, Auth Required)

```
/dashboard
├── /dashboard (Overview)
├── /my-courses (Kursus Saya)
│   └── /learn/:courseSlug (Course Player)
├── /course-catalog (Katalog Kursus) -> **tidak ada menu navigasi di sidebar, hanya lewat hyperlink dari halaman dashboard dan halaman kursus saya**
├── /certificates (Sertifikat)
├── /exp-level (EXP & Level)
├── /transactions (Transaksi)
├── /settings
│   ├── /settings/profile
│   └── /settings/security
```

### 5.2b Struktur Halaman — Internship App (Peserta Magang, Auth Required)

```
/internship
├── /internship/dashboard
├── /internship/attendance (Absensi)
├── /internship/tasks (Daftar Tugas)
│   ├── /internship/tasks/:taskId (Detail & Kumpul Tugas)
├── /internship/final-grade (Nilai Akhir)
└── /internship/settings (Pengaturan)
```

### 5.3 Struktur Halaman — Admin Panel

```
/admin
├── /admin/dashboard (Analytics)
├── /admin/courses (Manajemen Kursus)
│   └── /admin/courses/:id/edit
├── /admin/users (Manajemen Pengguna)
│   └── /admin/users/:id/edit
├── /admin/transactions (Transaksi)
├── /admin/vouchers (Voucher)
├── /admin/certificates (Sertifikat)
├── /admin/gamification (Gamifikasi)
│   ├── /admin/gamification/exp-level
│   ├── /admin/gamification/badges
│   │   ├── /admin/gamification/badges/create
│   │   └── /admin/gamification/badges/:id/edit
├── /admin/internship (Magang)
│   ├── /admin/internship/attendance
│   ├── /admin/internship/tasks
│   └── /admin/internship/tasks/:taskId/submissions/:submissionId (Detail Submisi Peserta)
└── /admin/settings (Konfigurasi Platform)
```

### 5.4 Struktur Halaman — Mentor (Auth Required)

```
/mentor
├── /mentor/dashboard
├── /mentor/attendance (Absensi — check-in harian mentor)
├── /mentor/students (Daftar Peserta)
├── /mentor/student-attendance (Absensi Peserta — pantau kehadiran kelas, read-only)
├── /mentor/tasks (Manajemen Tugas — Daftar Tugas)
│   ├── /mentor/tasks/create (Buat Tugas)
│   └── /mentor/tasks/:taskId (Detail Tugas)
│       └── /mentor/tasks/:taskId/submissions/:submissionId (Detail Submisi Peserta)
├── /mentor/grades (Nilai Akhir)
└── /mentor/settings (Pengaturan)
```

> **Catatan urutan navigasi sidebar:** Dashboard → **Absensi** (absensi pribadi mentor) → Daftar Peserta → **Absensi Peserta** (monitor kelas) → Tugas → Nilai Akhir → Pengaturan.

---

## 6. Feature Specifications

---

### 6.1 Authentication & Account Management

#### 6.1.1 Registrasi (Peserta Didik)

**Alur:**

1. User mengisi form registrasi: nama lengkap, email, password.
2. Sistem memvalidasi seluruh input.
3. Sistem mengirim email verifikasi ke alamat email yang diberikan.
4. User mengklik link verifikasi di email.
5. Akun aktif; user diarahkan ke halaman login.

**Validasi Input:**

- Nama lengkap: wajib, min 2 karakter.
- Email: wajib, format valid, unik di sistem.
- Password: wajib, min 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka.

**Catatan:** Akun Peserta Magang dan Mentor tidak dapat registrasi mandiri — hanya dibuat oleh Admin.

#### 6.1.2 Login

**Metode yang didukung:**

- Email + Password

**Alur Email+Password:**

1. User input email dan password.
2. Validasi kredensial.
3. Jika email belum diverifikasi, tampilkan pesan dan opsi kirim ulang email verifikasi.
4. Jika berhasil, redirect ke `/dashboard`.

**Keamanan:**

- Rate limiting pada endpoint login (max 5 percobaan gagal per 15 menit per IP).
- Session token disimpan di HTTP-only cookie.

#### 6.1.3 Lupa & Reset Password

1. User input email di halaman "Lupa Password".
2. Sistem mengirim email berisi link reset password (valid 1 jam).
3. User mengklik link di email → menuju halaman untuk mengisi password baru.
4. Password diperbarui; link menjadi tidak valid setelah digunakan.

#### 6.1.4 Pengaturan Akun

**Tab Profil:**

- Update: username (unik), nama lengkap, email, foto profil. **Peserta Magang dan Mentor terdapat Bidang dan Kelas, namun tidak dapat diubah.**
- Jika email diubah, sistem mengirim verifikasi ke email baru sebelum perubahan disimpan.

**Tab Keamanan:**

- Ganti password: input password lama, password baru, konfirmasi password baru.
- Sistem mengirim email notifikasi perubahan password ke email aktif.

---

### 6.2 Landing Page

Landing page bersifat publik, statis dari sisi user experience, dan dioptimalkan untuk SEO.

#### 6.2.1 Komponen Halaman Beranda (`/`)

- **Hero Section:** Headline utama, subheadline, CTA utama ("Lihat Kursus", "Mulai Belajar").
- **Highlight Fitur:** Showcase fitur unggulan platform (gamifikasi, sertifikat, magang).
- **Kursus Unggulan:** Tampilkan beberapa kursus terpopuler/terbaru (data dari backend).
- **Social Proof / Statistik:** Jumlah pelajar, kursus tersedia, sertifikat diterbitkan.
- **CTA Section:** Ajakan daftar akun.

#### 6.2.2 Kontak (`/contact`)

- Menampilkan tombol/link yang mengarahkan langsung ke WhatsApp.
- Tidak ada sistem live chat atau form kontak internal.

#### 6.2.3 SEO Requirements

- Meta title dan meta description unik per halaman.
- Open Graph tags untuk keperluan sharing media sosial.
- Sitemap XML yang di-generate otomatis.
- Structured data (JSON-LD) untuk halaman kursus.
- URL slug yang readable dan SEO-friendly (contoh: `/courses/belajar-web-programming`).

---

### 6.3 Course Catalog & Detail

#### 6.3.1 Halaman Katalog (`/courses`)

**Fitur:**

- Tampilkan seluruh kursus yang tersedia (status published oleh admin).
- **Search:** Input teks pencarian berdasarkan judul kursus.
- **Filter:**
  - Terbaru (newest added)
  - Terlama (first added)
  - Kategori: Multimedia / Web Programming / AI & Data / (kategori lain yang dikelola admin)
- Setiap card kursus menampilkan: thumbnail, judul, kategori, nama Instruktur, harga.

#### 6.3.2 Halaman Detail Kursus (`/courses/:slug`)

Halaman ini dapat diakses oleh siapapun (publik). Berisi:

| Seksi                              | Konten                                                                |
| ---------------------------------- | --------------------------------------------------------------------- |
| **Tentang Kursus**                 | Deskripsi lengkap kursus                                              |
| **Yang Akan Dipelajari (Benefit)** | Poin-poin hasil belajar                                               |
| **Pengajar/Instruktur**            | Nama, foto, bio singkat instruktur                                    |
| **Kurikulum**                      | Daftar Sprint dan Tahap (judul saja, tidak bisa diakses sebelum beli) |
| **Biaya**                          | Harga kursus dalam IDR                                                |
| **FAQ**                            | Pertanyaan umum seputar kursus                                        |

**CTA:** Tombol "Beli Kursus" — jika belum login, diarahkan ke halaman login.

**State tombol jika sudah beli:** Berubah menjadi "Lanjutkan Belajar" yang mengarah ke course player.

---

### 6.4 Purchase & Payment

#### 6.4.1 Alur Pembelian

```
User klik "Beli Kursus"
        │
        ▼
[Sudah login?]
  Tidak → Redirect ke /login (dengan redirect_back ke halaman kursus)
  Ya   ↓
        │
        ▼
[Sudah punya kursus ini?]
  Ya  → Tampilkan pesan "Kamu sudah memiliki kursus ini" + redirect ke course player
  Tidak ↓
        │
        ▼
Halaman/Modal Checkout
  - Ringkasan kursus & harga
  - Input kode voucher (opsional)
  - Pilih metode pembayaran
  - Tombol "Bayar Sekarang"
        │
        ▼
Sistem membuat Order (status: PENDING)
Timer 60 menit dimulai
        │
        ▼
User menyelesaikan pembayaran via Midtrans
        │
        ▼
[Payment Gateway Webhook]
  PAID   → Status: SUCCESS, kursus aktif, kirim email konfirmasi
  FAILED → Status: FAILED
  (Timer habis) → Status: EXPIRED (job scheduler)
```

#### 6.4.2 Halaman Checkout

**Komponen:**

- Thumbnail + judul kursus.
- Harga original.
- Input field kode voucher + tombol "Terapkan".
  - Jika valid: tampilkan potongan harga dan harga akhir.
  - Jika tidak valid: tampilkan pesan error.
- Harga final yang harus dibayar.
- Pilihan metode pembayaran (QRIS, Transfer Bank, E-Wallet via Midtrans).
- Timer countdown 60 menit (dimulai setelah klik "Bayar Sekarang").
- Tombol "Bayar Sekarang".

#### 6.4.3 Metode Pembayaran

Terintegrasi dengan **Midtrans**:

- QRIS
- Virtual Account (Transfer Bank) — BCA, BNI, BRI, Mandiri, BSI, Seabank, Jago, dll.
- E-Wallet — OVO, GoPay, DANA, ShopeePay
- Metode lainnya

#### 6.4.4 Status Transaksi

| Status    | Deskripsi                             | Warna Indikator |
| --------- | ------------------------------------- | --------------- |
| `PENDING` | Menunggu pembayaran                   | Kuning          |
| `SUCCESS` | Pembayaran dikonfirmasi, kursus aktif | Hijau           |
| `FAILED`  | Pembayaran gagal dari payment gateway | Merah           |
| `EXPIRED` | Melewati batas waktu 60 menit         | Abu-abu         |

Seluruh riwayat transaksi tersimpan permanen, termasuk yang expired atau failed.

#### 6.4.5 Pencegahan Double Purchase (idempotency)

- Sebelum proses checkout dimulai, sistem melakukan query: apakah user sudah memiliki `enrollment` aktif untuk kursus tersebut.
- Jika ya, proses checkout diblokir di sisi backend (bukan hanya UI).
- Juga mencegah pembuatan order baru jika sudah ada order `PENDING` untuk kursus yang sama dari user yang sama.

#### 6.4.6 Kebijakan Refund

- **Tidak ada refund** setelah pembayaran berhasil dan kursus aktif.
- Kebijakan ini harus ditampilkan secara jelas di halaman checkout (teks kecil di bawah tombol bayar).
- Jika terjadi dispute (misalnya: double charge dari sisi payment gateway), Admin menangani secara manual melalui panel transaksi di Admin Panel.

#### 6.4.7 Payment Gateway Webhook Handler

- Endpoint backend menerima webhook dari Midtrans untuk update status pembayaran.
- Webhook divalidasi menggunakan signature/token yang disediakan oleh payment gateway (header validasi sesuai dokumentasi Midtrans).
- Idempotency: setiap webhook diproses sekali; order yang sudah `SUCCESS` tidak bisa diubah statusnya.

---

### 6.5 Learning Page & Course Player

#### 6.5.1 Sidebar Navigasi — Peserta Didik

| Menu        | Deskripsi                              |
| ----------- | -------------------------------------- |
| Dashboard   | Halaman utama peserta didik            |
| Kursus Saya | Daftar kursus yang dimiliki            |
| Sertifikat  | Daftar sertifikat yang telah diperoleh |
| EXP & Level | Halaman progres gamifikasi             |
| Transaksi   | Riwayat transaksi pembelian            |
| Pengaturan  | Profil dan keamanan akun               |

#### 6.5.2 Sidebar Navigasi — Peserta Magang

Peserta Magang memiliki sidebar berbeda dari Peserta Didik, hanya berisi fitur sistem magang:

| Menu        | Deskripsi                           |
| ----------- | ----------------------------------- |
| Dashboard   | Halaman utama peserta magang        |
| Absensi     | Riwayat dan check-in absensi harian |
| Tugas       | Daftar tugas dari mentor            |
| Nilai Akhir | Melihat nilai akhir magang          |
| Pengaturan  | Profil dan keamanan akun            |

Peserta Magang **tidak memiliki akses** ke fitur Peserta Didik seperti kursus, sertifikat, EXP & level, dan transaksi.

#### 6.5.3 Dashboard — Peserta Didik

Menampilkan:

- Total kursus dimiliki.
- Total kursus in-progress.
- Total sertifikat diperoleh.
- Progres belajar kursus yang sedang aktif (progress bar + persentase).
- Kursus yang tersedia di katalog (rekomendasi atau terbaru).

#### 6.5.4 Dashboard — Peserta Magang

Memprioritaskan informasi magang:

- Banner greeting dan kalimat penyemangat.
- Card Status absensi hari ini (Sudah/Belum absen + tombol Check-In jika belum dan masih dalam window waktu).
- Card Pengingat jumlah tugas jika ada yang perlu diselesaikan sebelum batas waktu.

#### 6.5.5 Course Player (`/learn/:courseSlug`)

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  [Sidebar Kiri]      │   [Area Konten Utama]    │
│                      │                          │
│  Sprint 1 ▼          │   [Video Player]         │
│    ✅ Tahap 1 Video  │       atau               │
│    ✅ Tahap 2 Video  │   [Tampilan Quiz]        │
│    🔒 Tahap 3 Quiz   │                          │
│                      │   ─────────────          │
│  Sprint 2 🔒         │   [Tab: Notes]           │
│    ...               │   Deskripsi konten       │
│                      │   per tahap ini          │
└─────────────────────────────────────────────────┘
```

**Sidebar Course Player:**

- Daftar seluruh Sprint dan Tahap dalam kursus.
- Status per tahap: Selesai (✅), Sedang Dikerjakan (→), Terkunci (🔒).
- Sprint yang belum terbuka ditampilkan terkunci sampai sprint sebelumnya selesai.

**Area Konten Utama:**

- Jika tahap = Video: tampilkan video player (Bunny.net embed dengan signed URL).
- Jika tahap = Quiz: tampilkan antarmuka quiz pilihan ganda.

**Tab Notes:**

- Deskripsi/catatan yang dibuat oleh Admin untuk tahap tersebut.
- Dapat berisi teks, link, dan informasi tambahan (bersifat read-only bagi pengguna).
- Equivalent dengan deskripsi video di YouTube.

#### 6.5.6 Video Completion

Dua cara menandai video selesai:

1. **Otomatis:** Video ditonton hingga selesai (mencapai durasi akhir).
2. **Manual:** User mengklik tombol "Tandai Selesai" yang tersedia di sekitar player.

Setelah video ditandai selesai:

- Tahap terkunci berikutnya terbuka.
- EXP +15 diberikan ke akun user.
- Progres kursus diperbarui.

#### 6.5.7 Quiz

**Konfigurasi:**
| Parameter | Nilai |
|---|---|
| Tipe soal | Pilihan ganda |
| Nilai minimum lulus | 80 (dari 100) |
| Batas percobaan sebelum cooldown | 3x |
| Durasi cooldown | 30 menit |
| Pola cooldown | Berulang (setelah cooldown habis, dapat mencoba 3x lagi, lalu cooldown kembali) |

**Alur Quiz:**

1. User membuka tahap quiz.
2. Soal pilihan ganda ditampilkan satu per satu (tekan next).
3. User submit jawaban.
4. Sistem menampilkan skor hasil.
5. Jika skor ≥ 80:
   - Quiz berstatus **Lulus**.
   - EXP +90 diberikan.
   - Tahap berikutnya terbuka.
6. Jika skor < 80:
   - Percobaan ke-1 atau ke-2: tampilkan tombol "Coba Lagi".
   - Setelah percobaan ke-3 gagal: tampilkan pesan cooldown + countdown timer 30 menit.
   - Setelah 30 menit: penghitung percobaan reset, user dapat mencoba 3x lagi.

**EXP dari quiz:** Hanya diberikan sekali (saat pertama kali lulus), tidak diberikan lagi jika quiz sudah pernah lulus.

#### 6.5.8 Progres Kursus

- Progres dihitung sebagai: `(jumlah tahap selesai / total tahap) × 100%`.
- Ditampilkan sebagai progress bar dan persentase di dashboard dan halaman "Kursus Saya".

> **Catatan implementasi:** EXP +600 untuk menyelesaikan kursus diberikan saat progres mencapai 100%.

---

### 6.6 Certificate System

#### 6.6.1 Klaim Sertifikat

- Sertifikat dapat diklaim setelah progres kursus mencapai **100%**.
- Tombol klaim tersedia di:
  - Halaman course player (setelah semua tahap selesai).
  - Halaman "Sertifikat" di sidebar.
- Sertifikat di-generate sebagai file **PDF** secara on-demand.

#### 6.6.2 Konten Sertifikat PDF

| Field                       | Sumber Data                                | Keterangan                      |
| --------------------------- | ------------------------------------------ | ------------------------------- |
| Nama Penerima               | Nama lengkap akun user                     | —                               |
| Nama Kursus                 | Judul kursus                               | —                               |
| Tanggal Terbit (Issue Date) | Tanggal klaim                              | Format: DD/MM/YYYY              |
| Tanggal Kedaluwarsa         | Issue Date + konfigurasi global            | Opsional; default tidak ada     |
| Nomor Sertifikat Unik       | Auto-generated                             | Format: `NLA-YYYYMMDD-XXXXXXXX` |
| URL Verifikasi              | `https://domain.com/verify/:certificateId` | Tercetak di sertifikat          |

**Expiration Date:**

- Dikonfigurasi admin secara global (default: 3 tahun dari tanggal terbit).
- Jika admin tidak mengisi konfigurasi expiry → field ini **tidak ditampilkan** di PDF.

#### 6.6.3 Halaman Verifikasi Publik (`/verify/:certificateId`)

- Dapat diakses oleh siapapun tanpa login.
- Menampilkan: nama penerima, nama kursus, tanggal terbit, tanggal kedaluwarsa (jika ada), status validitas sertifikat (Valid / Kedaluwarsa).

---

### 6.7 Gamification System

Sistem EXP, leveling, dan badge hanya berlaku untuk role **Peserta Didik**.
Role lainnya (Mentor dan Peserta Magang) tidak mendapatkan EXP dan tidak masuk dalam sistem gamifikasi.

#### 6.7.1 Sumber EXP

| Aktivitas                     | EXP  | Catatan                             |
| ----------------------------- | ---- | ----------------------------------- |
| Menyelesaikan 1 video         | +15  | Diberikan sekali per video          |
| Lulus 1 quiz                  | +90  | Diberikan sekali saat pertama lulus |
| Menyelesaikan 1 kursus (100%) | +600 | Bonus penyelesaian kursus           |

**Simulasi 1 kursus penuh** (60 video + 4 quiz):

```
(60 × 15) + (4 × 90) + 600 = 900 + 360 + 600 = 1.860 EXP
```

#### 6.7.2 Sistem Leveling

**Aturan:**

- EXP **reset ke 0** setiap kali pengguna naik level.
- Kebutuhan EXP untuk naik level bertambah secara linear setiap level.

**Rumus kebutuhan EXP (REQ):**

```
REQ(L) = 744 + 124 × (L - 1)
```

Di mana `L` = level saat ini.

**Tabel Level (contoh):**

| Level Saat Ini | Naik ke Level | EXP Dibutuhkan |
| -------------- | ------------- | -------------- |
| 1              | 2             | 744            |
| 2              | 3             | 868            |
| 3              | 4             | 992            |
| 4              | 5             | 1.116          |
| 5              | 6             | 1.240          |
| 9              | 10            | 1.860          |
| 14             | 15            | 2.480          |

#### 6.7.3 Badge & Title per Level

| Level | Badge / Title |
| ----- | ------------- |
| 1     | Beginner      |
| 5     | Explorer      |
| 10    | Scholar       |
| 15    | Master        |

Badge juga diberikan saat menyelesaikan suatu kursus secara penuh (badge per kursus dikelola dari halaman Gamifikasi dengan trigger COURSE_SPECIFIC).

#### 6.7.4 Voucher Reward per Level

| Level Dicapai | Reward                 |
| ------------- | ---------------------- |
| Level 5       | Voucher diskon **20%** |
| Level 10      | Voucher diskon **35%** |
| Level 15      | Voucher diskon **50%** |

- Kode voucher di-generate secara **random** oleh sistem (kombinasi huruf besar, huruf kecil, dan angka; case-sensitive).
- Voucher hanya bisa digunakan **1 kali** dan memiliki masa berlaku.
- Voucher reward dapat digunakan untuk pembelian kursus apapun.

#### 6.7.5 Halaman EXP & Level (`/exp-level`)

Menampilkan:

- Level saat ini + title/badge aktif.
- EXP saat ini + progress bar menuju level berikutnya.
- EXP yang dibutuhkan untuk naik level berikutnya.
- **Reward Roadmap:** Daftar level milestone (5, 10, 15) beserta reward yang akan didapat:
  - Jika sudah tercapai: tampilkan kode voucher yang diterima + status (aktif/sudah dipakai/expired).
  - Jika belum tercapai: tampilkan preview reward dalam keadaan "terkunci" (blur/locked state).
- Kumpulan seluruh badge (nama, gambar badge, dan cara memperoleh badge tersebut). Badge yang dimiliki akan berwarna terang dan menarik, sedangkan badge yang belum dimiliki akan berwarna gelap atau terkunci. Urutan badge yang ditampilkan adalah badge yang dimiliki, kemudian badge yang belum dimiliki.

---

### 6.8 Voucher System

Terdapat dua jenis voucher dalam sistem:

#### 6.8.1 Voucher Reward Otomatis

Dibuat dan didistribusikan otomatis oleh sistem saat user mencapai level 5, 10, atau 15. Detail lihat bagian 6.7.4.

#### 6.8.2 Voucher Manual (Admin-Created)

Admin dapat membuat kode voucher promosi dengan konfigurasi penuh.

**Field Konfigurasi Voucher:**

| Field                     | Tipe                 | Wajib | Keterangan                                                            |
| ------------------------- | -------------------- | ----- | --------------------------------------------------------------------- |
| Kode Voucher              | String               | Ya    | Kode yang diinput user saat checkout                                  |
| Deskripsi                 | String               | Tidak | Catatan internal admin                                                |
| Persentase Diskon         | Integer (1–100)      | Ya    | Termasuk bisa 100%                                                    |
| Tanggal Mulai Berlaku     | Date                 | Ya    | Voucher belum aktif sebelum tanggal ini                               |
| Tanggal Kedaluwarsa       | Date                 | Ya    | Voucher tidak berlaku setelah tanggal ini                             |
| Batas Penggunaan Total    | Integer              | Tidak | Total berapa kali voucher bisa digunakan (null = unlimited)           |
| Batas Penggunaan per User | Integer              | Ya    | Default: 1                                                            |
| Berlaku untuk Role        | Enum                 | Ya    | Default: `ALL`                                                        |
| Berlaku untuk Category    | UUID (nullable)      | Tidak | Jika diisi, hanya user dengan kategori tersebut yang bisa gunakan     |
| Berlaku untuk User ID     | UUID (nullable)      | Tidak | Jika diisi, hanya user dengan ID tersebut yang bisa gunakan           |
| Berlaku untuk Kursus      | Course ID (nullable) | Tidak | Jika diisi, hanya berlaku untuk kursus tersebut (null = semua kursus) |
| Status Aktif              | Boolean              | Ya    | Admin dapat menonaktifkan voucher kapan saja                          |

**Validasi saat user input voucher di checkout:**

1. Kode ditemukan di database.
2. Status aktif = true.
3. Tanggal saat ini dalam rentang mulai–kedaluwarsa.
4. Belum mencapai batas penggunaan total.
5. User belum melebihi batas penggunaan per user untuk voucher ini.
6. Role user sesuai ketentuan voucher.
7. Bidang user sesuai (jika ada ketentuan bidang).
8. User ID sesuai (jika ada ketentuan user ID).
9. Kursus yang dibeli sesuai (jika ada ketentuan kursus).

Jika semua valid → tampilkan potongan harga.  
Jika tidak valid → tampilkan pesan error yang deskriptif.

---

### 6.9 Internship System (Magang)

#### 6.9.1 Pencocokan Mentor & Peserta Magang

- Setiap akun Peserta Magang dan Mentor memiliki satu field pencocokan: Kelas. Kelas sudah mengandung informasi Batch dan Bidang di dalam penamaannya (contoh: Batch 1 - Web Programming - A).
- Mentor hanya melihat Peserta Magang yang memiliki Kelas yang sama dengannya.

**Data akun Peserta Magang (diisi Admin saat membuat akun):**

- Nama lengkap.
- Email.
- Password awal.
- Batch (pilih dari daftar, contoh: Batch 1 2025) — wajib.
- Bidang (pilih dari daftar, contoh: Programming) — wajib.
- Kelas (pilih dari daftar, contoh: Kelas A) — wajib (per kelas maksimal 10 peserta magang).
- Institusi (opsional) (Bisa diisi nama Universitas/Smk)
- Informasi tambahan lainnya. (opsional)

**Data akun Mentor (diisi Admin saat membuat akun):**

- Nama lengkap
- Email
- Password awal
- Batch (pilih dari list, contoh: Batch 1 2025) — wajib.
- Bidang (pilih dari daftar, contoh: Programming) — wajib.
- Kelas (pilih dari daftar, contoh: Kelas A) — wajib.
- Informasi tambahan lainnya. (opsional)

#### 6.9.2 Fitur Absensi

**Aturan Absensi:**

- Peserta Magang melakukan **Check-In** sekali per hari.
- Tombol Check-In hanya aktif dalam **jendela waktu yang dikonfigurasi Admin** (contoh: 09.00–12.00 WIB).
- Di luar jendela waktu: tombol Check-In tidak tersedia; hari tersebut dianggap tidak hadir jika sudah lewat.
- Status absensi per hari:
  - **Hadir (Hijau):** Sudah check-in di hari tersebut.
  - **Tidak Hadir (Merah):** Tidak check-in dan jendela waktu sudah lewat.
  - **Belum (Abu-abu):** Hari ini, jendela waktu belum dimulai atau sedang berlangsung namun belum check-in.

**Modifikasi Absensi:**

- Hanya **Admin** yang dapat mengubah status absensi secara manual (misal: koreksi error sistem atau izin khusus).

**Tampilan Rekap Absensi:**

- Peserta Magang: melihat rekap absensi pribadi (kalender per bulan, status hadir/tidak hadir, ditandai dengan warna sesuai status).
- Mentor: melihat rekap absensi seluruh peserta di bawah bimbingannya per hari pada halaman **Absensi Peserta** (`/mentor/student-attendance`) — tabel per hari menampilkan nama, jam check-in, dan status, dengan filter tanggal untuk meninjau data sebelumnya (read-only; mentor tidak dapat mengubah). Halaman ini sebelumnya berada di `/mentor/attendance`, dipindah agar URL tersebut dipakai untuk absensi pribadi mentor (lihat §6.9.2.1).
- Admin: melihat dan dapat mengedit seluruh data absensi.

**Periode Magang (rentang kalender):**

- Kalender absensi dibatasi oleh `Batch.startDate`–`Batch.endDate` (lihat §9.4). Navigasi bulan tidak dapat melewati bulan tanggal mulai (prev) maupun bulan tanggal berakhir (next).
- Bulan tampil pertama saat halaman dibuka = bulan berjalan jika berada dalam periode; jika di luar, di-clamp ke batas periode terdekat.
- Tanggal di luar `[startDate, endDate]` ditandai **Di luar periode** (netral) dan **tidak** dihitung sebagai kehadiran/ketidakhadiran.
- Hari libur (lihat §9.6.1 Holiday) di dalam periode ditandai **Libur** beserta keterangannya, selain Sabtu/Minggu yang sudah otomatis libur.

**Waktu Absensi:**

- Jam mulai window (contoh: 09:00).
- Jam selesai window (contoh: 12:00).
- Timezone: WIB (UTC+7) — hardcoded karena target pasar Indonesia.
- Jendela jam ini **global** (satu nilai untuk semua batch, bukan per-batch). Saat ini disimpan sebagai konstanta platform (`src/lib/internship-config.ts`); dipromosikan ke tabel `Setting` ketika halaman admin settings dibangun.
- **Gating server-side:** endpoint Check-In menghitung waktu WIB sendiri dan menolak absen di luar jendela, di hari libur/akhir pekan, di luar periode batch, atau jika sudah absen (idempoten via unique `(userId, date)`). Hari kerja lampau tanpa baris `Attendance` PRESENT diturunkan sebagai **Tidak Hadir** saat dibaca (tanpa job materialisasi ABSENT).

#### 6.9.2.1 Absensi Mentor (Check-In Pribadi)

> **Enhancement (di luar PRD awal).** Mentor kini **juga melakukan absensi pribadi** dengan alur check-in yang sama persis seperti Peserta Magang. Halaman: `/mentor/attendance` (label sidebar **"Absensi"**). Halaman pemantauan kehadiran peserta dipindah ke `/mentor/student-attendance` (label **"Absensi Peserta"**).

**Tujuan:** Mentor merekam kehadiran hariannya sendiri sepanjang periode batch yang ia bimbing, sejajar dengan kewajiban absensi peserta.

**Alur:**

1. Mentor membuka `/mentor/attendance` atau menekan tombol **Check-In** pada hero dashboard `/mentor/dashboard`.
2. Tombol Check-In aktif hanya dalam **jendela waktu global WIB** (sama dengan peserta, `INTERNSHIP_CHECKIN_WINDOW`, contoh 09.00–12.00) pada hari kerja dalam periode batch.
3. Saat ditekan, server merekam kehadiran hari ini; status berubah menjadi **Hadir** dan jam check-in ditampilkan.
4. Kalender riwayat menampilkan rekap kehadiran mentor per bulan (Hadir/Tidak Hadir/Belum/Libur/Di luar periode), identik dengan tampilan kalender peserta.

**Business Rules:**

- **Periode** mentor diturunkan dari batch kelas yang ia bimbing (`MentorProfile → Class → Field → Batch.startDate/endDate`).
- **Jendela jam global** dan timezone WIB sama persis dengan absensi peserta (§6.9.2).
- **Hanya hari kerja:** Sabtu/Minggu dan `Holiday` (§9.6.1) tidak dapat di-check-in; tanggal di luar periode ditolak.
- **Idempoten:** maksimum satu check-in per hari (unique `(userId, date)`; percobaan kedua → 409).
- **Server-authoritative:** endpoint `POST /api/mentor/attendance/check-in` menghitung waktu WIB sendiri dan memvalidasi seluruh gating; jam klien tidak dipercaya. Pembacaan kalender via `GET /api/mentor/attendance?year=&month=`.
- **Penyimpanan:** memakai ulang tabel `Attendance` dengan `userId` mentor (tanpa perubahan skema). Karena mentor tidak memiliki `InternshipProfile`, baris absensi mentor **tidak** muncul atau terhitung pada roster/rekap **Absensi Peserta** mana pun.
- **Modifikasi:** hanya Admin yang dapat mengoreksi absensi (konsisten dengan §6.9.2); mentor tidak dapat mengubah absensinya sendiri setelah tercatat.
- **Status absensi** (Hadir/Tidak Hadir/Belum) dan derivasi "hari kerja lampau tanpa baris = Tidak Hadir" mengikuti aturan yang sama dengan peserta.

**Dashboard:** Kartu informasi "Kehadiran hari ini" pada hero dashboard mentor diganti menjadi **tombol Check-In pribadi** (meniru hero Peserta Magang). Kartu donut **Kehadiran Kelas** (ringkasan kehadiran peserta) tetap ditampilkan di bawah hero.

#### 6.9.3 Fitur Tugas

**Alur Pembuatan Tugas (Mentor):**

1. Mentor membuat tugas baru: judul, deskripsi, deadline (tanggal + jam), dan satu lampiran opsional berupa file (PDF, DOC, ZIP, gambar) atau satu tautan URL.
2. Tugas terdistribusi ke seluruh Peserta Magang di bawah bimbingan Mentor tersebut.
3. Peserta Magang mendapat notifikasi in-app.

**Alur Pengumpulan Tugas (Peserta Magang):**

1. Peserta melihat daftar tugas di menu "Tugas".
2. Peserta mengklik tugas → melihat detail + deadline.
3. Peserta upload hasil tugas: berkas (PDF, DOC, ZIP, gambar) **atau** input tautan URL.
4. Status tugas berubah menjadi "Submitted".
5. Mentor mendapat notifikasi in-app ("<Nama Peserta> baru saja mengumpulkan tugas.").

**Alur Pengembalian Tugas (Mentor):**

1. Mentor membuka daftar submisi tugas per peserta.
2. Mentor memberikan keputusan:
   - **Kembalikan (❌):** Mentor wajib mengisi feedback (teks). Status tugas tersebut menjadi "Not submitted".
3. Peserta Magang mendapat notifikasi in-app dan email.

**Alur Revisi (Peserta Magang):**

- Jika tugas dikembalikan dan deadline **belum terlewat**: peserta dapat upload ulang (revisi).
- Setelah revisi, status akan kembali menjadi "Submitted", mentor akan melakukan pengecekan ulang.
- Akan terus seperti itu, jika mentor sudah cek dan setuju, maka mentor tidak perlu lagi mengembalikan tugas tersebut sampai deadline berakhir (status tetap "Submitted").
- Jika deadline **sudah terlewat**: form upload ditutup; tidak dapat submit lagi.

**Status Tugas:**

| Status          | Deskripsi              |
| --------------- | ---------------------- |
| `NOT SUBMITTED` | Tugas belum dikerjakan |
| `SUBMITTED`     | Sudah dikumpulkan      |

**Riwayat Tugas:**

- Peserta Magang dapat melihat seluruh riwayat tugas (termasuk yang sudah lewat deadline, baik dikerjakan maupun tidak).

#### 6.9.4 Nilai Akhir

- Mentor dapat mengisi nilai akhir (skala **0–100**, integer) untuk setiap Peserta Magang kapan saja.
- Nilai ditampilkan di tabel "Nilai Akhir" pada menu magang peserta.
- Kolom nilai kosong hingga mentor mengisi.
- Mentor dapat mengubahnya kapan saja, namun admin bisa mengubah nya juga.

### 6.10 Notification System

#### 6.10.1 In-App Notification

**Komponen UI:**

- **Bell icon** di navbar dengan badge counter (jumlah notifikasi belum dibaca).
- **Titik merah** di ikon navigasi sidebar sebagai indikator ada aksi/pembaruan pada menu tersebut.
- Hover Dropdown notifikasi menampilkan: teks notifikasi dan berapa waktu terlewat (misal 1 jam yang lalu).

**Trigger Notifikasi In-App:**

| Penerima       | Trigger                                            |
| -------------- | -------------------------------------------------- |
| Peserta Magang | Mendapat tugas baru dari mentor                    |
| Peserta Magang | Tugas mendapat feedback (dikembalikan) dari mentor |
| Mentor         | Peserta magang mengumpulkan tugas                  |

#### 6.10.2 Email Notification

Dikirim via **Resend + React Email**.

| Trigger               | Penerima                   | Isi Email                                          |
| --------------------- | -------------------------- | -------------------------------------------------- |
| Registrasi berhasil   | User baru                  | Link verifikasi email                              |
| Lupa password         | User (Peserta Didik)       | Link reset password (valid 1 jam)                  |
| Perubahan password    | User (Peserta Didik)       | Notifikasi password berhasil diubah                |
| Perubahan email       | User (Peserta Didik)       | Link verifikasi email baru                         |
| Checkout berhasil     | Pembeli                    | Ringkasan order + instruksi pembayaran + countdown |
| Pembayaran berhasil   | Pembeli                    | Konfirmasi pembelian + link akses kursus           |
| Kursus selesai (100%) | Peserta Didik (Penyelesai) | Pengingat untuk klaim sertifikat                   |

---

### 6.11 Admin Panel

#### 6.11.1 Akses

- URL: `/admin`
- Login menggunakan email + password (akun dengan role `ADMINISTRATOR`).
- Tidak ada social login untuk admin.
- Redirect otomatis ke `/admin/dashboard` setelah login.

#### 6.11.2 Analytics Dashboard (`/admin/dashboard`)

**Statistik utama (card metrics):**

- Total pengguna terdaftar (breakdown per role).
- Total kursus aktif.
- Total pendapatan (IDR).
- Total transaksi (breakdown per status).
- Total sertifikat diterbitkan.
- Total peserta magang aktif.

**Grafik:**

- Pendapatan per bulan (line chart).
- Pendaftaran pengguna baru per bulan (bar chart).
- Kursus terjual per bulan (bar chart).
- Kursus terlaris (bar chart/top list).

#### 6.11.3 Manajemen Kursus

**Daftar Kursus:** _(diimplementasikan di `/admin/courses`)_

- Tabel: thumbnail, judul (+ slug), kategori, instruktur, harga, jumlah peserta, tanggal dibuat, **tanggal publish**, status (Published/Draft/Archived).
- Filter: pencarian judul (debounce), dropdown kategori, dropdown status. Pagination 10/halaman. State filter disimpan di query-param URL (DB-backed, mirror pola katalog).
- Aksi: **Tambah** (→ `/admin/courses/new`), **Edit** (→ `/admin/courses/[id]/edit`), **Hapus**.
- **Hapus** dilindungi: kursus yang sudah punya peserta (enrollment) atau transaksi (order) **tidak dapat dihapus** (HTTP 409) — arahkan ke Archive (lihat §6.11.3.2) agar data terjaga. Hanya kursus tanpa peserta/transaksi yang boleh dihapus permanen.
- `Course.publishedAt` (nullable) di-stamp saat transisi pertama ke Published; Draft/Archived yang belum pernah Published bernilai kosong ("—").

**Detail Kursus:**

- Menampilkan seluruh informasi kursus (Form)
- Aksi: Edit

| Status    | Deskripsi                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Draft     | Kursus masih dalam proses pembuatan, tidak terlihat publik                                                  |
| Published | Kursus aktif dan dapat diakses publik                                                                       |
| Archived  | Kursus dinonaktifkan sementara (maintenance/koreksi), tidak dapat diakses publik namun data tetap tersimpan |

**Form Kursus (Tambah/Edit):**

| Field               | Tipe                         | Keterangan                               |
| ------------------- | ---------------------------- | ---------------------------------------- |
| Judul Kursus        | String                       | —                                        |
| Slug                | String                       | Auto-generated dari judul, dapat diedit  |
| Deskripsi           | Rich Text                    | Tentang kursus                           |
| Kategori            | Select                       | Dari daftar kategori yang dikelola admin |
| Thumbnail           | Image Upload                 | —                                        |
| Harga (IDR)         | Integer                      | —                                        |
| Pengajar/Instruktur | String + Image               | Nama dan foto instruktur                 |
| Benefit             | List of String               | Poin-poin yang akan dipelajari           |
| FAQ                 | List of Q&A                  | Pertanyaan dan jawaban                   |
| Status              | Draft / Published / Archived | —                                        |

#### 6.11.3.2 Mengarsipkan Kursus

Ketika admin mengubah status kursus menjadi **Archived**:

- **Tidak ada perubahan data** — semua data (sprint, step video, quiz, peserta, riwayat progres) tetap tersimpan.
- Kursus tidak muncul di halaman listing publik dan pencarian.
- Pembelian baru dinonaktifkan.
- Akses untuk peserta yang **sudah membeli** kursus tetap aktif (dapat melanjutkan belajar dan mengunduh sertifikat).
- Status peserta dalam kursus tidak berubah menjadi "tidak terdaftar".
- Admin dapat mengubah status kembali menjadi Draft atau Published kapan saja.

**Manajemen Kurikulum (Sprint & Tahap):**

- Admin dapat menambah, mengedit, mengurutkan, dan menghapus Sprint.
- Di dalam Sprint, admin dapat menambah, mengedit, mengurutkan, dan menghapus Tahap.
- Tipe tahap: **Video** atau **Quiz**.

**Form Tahap Video:**
| Field | Keterangan |
|---|---|
| Judul | Judul tahap/step video |
| Upload Video | Upload ke Bunny.net (MP4, WebM, Maks. 500MB) |
| Deskripsi Materi | Teks deskripsi/catatan materi, ditampilkan di Overview/Deskripsi Materi |

**Form Tahap Quiz:**
| Field | Keterangan |
|---|---|
| Judul | Judul quiz |
| Deskripsi Materi | Teks deskripsi/catatan materi, ditampilkan di tab Overview/Deskripsi Materi |
| Daftar Soal | Tambah/edit soal pilihan ganda (gambar/teks) dan jawabannya (gambar/teks) (min. 2 opsi jawaban, 1 jawaban benar) |
| Nilai Minimum Lulus | Integer (default: 80) |
| Notes | Opsional |

**Penggantian File Video:**
Jika admin mengganti file video pada step yang sudah ada:

- File baru diupload ke Bunny.net (via TUS) dan mendapat `bunnyVideoId` baru.
- Database step di-update dengan `bunnyVideoId` baru (status kembali `PROCESSING` sampai webhook Bunny melaporkan `READY`).
- **File video lama langsung dihapus dari Bunny** (best-effort, setelah swap DB tersimpan) untuk otomatis menghemat storage — keputusan user, menggantikan buffer rollback 7-hari (`VideoArchive`) sebelumnya. Tidak ada rollback yang dipertahankan.

**Validasi Sebelum Publish:**
Sebelum status course dapat diubah menjadi Published, sistem memvalidasi:

- Kursus memiliki judul, deskripsi, harga, dan thumbnail.
- Minimal terdapat satu sprint.
- Setiap sprint memiliki minimal satu step.
- Setiap step bertipe video memiliki file video yang valid (sudah terupload ke Bunny.net).
- Setiap step bertipe kuis memiliki minimal satu pertanyaan.
- Urutan sprint dan step tidak ada yang rusak/kosong.

Jika ada yang tidak lolos validasi, sistem menampilkan pesan error spesifik dan status tidak berubah.

#### 6.11.4 Manajemen Pengguna

**Daftar Pengguna:**

- Filter berdasarkan role.
- Tabel: nama, email, role, bidang dan kelas (khusus magang/mentor), status akun, tanggal daftar.
- Aksi: Lihat Detail, Edit, Nonaktifkan, Hapus.

**Membuat Akun (Peserta Didik):**

- Admin dapat membuat akun peserta didik manual jika diperlukan.
- Field: nama lengkap, email, password.

**Catatan Pembatasan Role:**

- Peserta Magang dan Mentor tidak dapat mengubah email maupun password akun mereka
  sendiri (kecuali username). Akun keduanya dibuat dan dikelola sepenuhnya oleh Admin. Jika diperlukan
  perubahan email atau password, harus dilakukan oleh Admin melalui fitur edit akun
  di Admin Panel.

**Membuat Akun Peserta Magang:**
| Field | Wajib | Keterangan |
|---|---|---|
| Nama Lengkap | Ya | — |
| Email | Ya | - |
| Password Awal | Ya | — |
| Kelas | Ya | Pilih dari daftar kelas yang tersedia (sudah mencakup info Batch dan Bidang, contoh: Batch 1 - Web Programming - A) |
| Institusi | Tidak | - |

**Membuat Akun Mentor:**
| Field | Wajib | Keterangan |
|---|---|---|
| Nama Lengkap | Ya | — |
| Email | Ya | - |
| Password Awal | Ya | — |
| Kelas | Ya | Pilih dari daftar kelas yang tersedia (sudah mencakup info Batch dan Bidang) |

**Menonaktifkan / Menghapus Akun:**

- Nonaktifkan: akun tidak bisa login namun data tetap tersimpan.
- Hapus: soft delete (data tetap ada di database untuk keperluan audit).

**Implementasi (v1.0) — `/admin/users`, `/admin/users/new`, `/admin/users/:id/edit`:**

- Halaman daftar DB-backed meniru pola Manajemen Kursus (loader → API → hook → view ber-URL): pencarian nama/email, filter role & status (Aktif/Nonaktif; akun terhapus selalu disembunyikan), urut tanggal daftar (terbaru/terlama), pagination. Kolom: pengguna (avatar+nama+email), role, kelas (magang/mentor), tanggal daftar, status, aksi (Edit, Nonaktifkan/Aktifkan, Hapus). "Lihat Detail" digabung ke halaman Edit.
- **Role dikunci** setelah akun dibuat — halaman Edit menampilkan role read-only (tanpa migrasi profil/gamifikasi). Role yang bisa dibuat lewat UI: Peserta Didik, Peserta Magang, Mentor (**bukan** Administrator).
- **Hapus = soft delete** via kolom baru `User.deletedAt` (sekaligus `isActive=false` + cabut sesi). Admin tidak bisa menghapus akun sendiri maupun akun Administrator. Nonaktifkan = toggle `isActive` (login diblok oleh `databaseHooks.session.create.before` di `auth.ts`).
- **Password (keputusan keamanan):**
  - **Mentor / Peserta Magang** — admin men-set password langsung lewat field "Password Baru" opsional di Edit (dikelola penuh oleh admin sesuai aturan di atas).
  - **Peserta Didik** — admin **tidak** menyimpan password aktif. Aksi **"Set Password Sementara"** (dialog dua-langkah) men-set password sementara + flag baru `User.mustChangePassword=true`. Saat user login, ia diarahkan ke halaman **`/ganti-password`** dan tidak bisa mengakses halaman manapun sampai password diganti; setelah diganti, flag dibersihkan, seluruh sesi dicabut, dan user login ulang dengan password barunya. Peserta Didik & Administrator lain tetap mengandalkan alur reset password mandiri (lupa password).
- Pembuatan akun memakai hasher resmi Better Auth (`hashPassword` dari `better-auth/crypto`, scrypt default) — membuat baris `User` + `Account` (`providerId:"credential"`, `emailVerified:true`) + profil/kelas (magang/mentor) + `UserGameProfile` (Peserta Didik) dalam satu transaksi. Kelas magang divalidasi terhadap kuota `Class.maxStudents`.

#### 6.11.5 Manajemen Transaksi

- Tabel seluruh transaksi **Peserta Didik** (`/admin/transactions`): kolom ID,
  Tanggal (WIB), Pengguna (nama+email), Kursus, Jumlah (IDR), Status, dan aksi
  **Detail**. Semua status ditampilkan (PENDING/SUCCESS/FAILED/EXPIRED).
- **Search** by ID transaksi, nama/email pengguna, atau judul kursus (insensitive,
  satu kotak), **sort** berdasarkan tanggal (Terbaru/Terlama), dan **filter status**.
  State filter/sort/search/halaman tersimpan di URL.
- **Detail transaksi** identik dengan kartu invoice Peserta Didik (komponen `InvoiceCard`
  yang sama). CTA berbeda untuk admin:
  - **Terima Pembayaran** (hanya order PENDING) → menjalankan jalur fulfillment penuh
    (`fulfillOrderPaid`): status → SUCCESS + `paidAt`, buat `Enrollment`, kirim email
    konfirmasi. SUCCESS bersifat immutable (guard 409 untuk order non-PENDING).
  - **Batalkan Pembayaran** (hanya order PENDING) → status → **FAILED** (tanpa enrollment).
  - **Unduh** bukti transaksi sebagai gambar PNG (hanya order SUCCESS).
  - **Hapus (soft delete)** → set `Order.deletedAt`; transaksi hilang dari daftar admin
    tetapi baris tetap disimpan untuk audit dan tidak menghapus enrollment yang sudah aktif.
    Riwayat Peserta Didik tidak terpengaruh (loader Peserta Didik tidak memfilter `deletedAt`).
- Semua aksi Terima/Batalkan/Hapus dikonfirmasi via dialog dan dicatat di `AuditLog`
  (`ORDER_ACCEPT` / `ORDER_CANCEL` / `ORDER_DELETE`, beserta admin pelaku).
- **Notifikasi peserta**: aksi Terima/Batalkan menulis `Notification` ke peserta
  (`NotificationType.PAYMENT_ACCEPTED` / `PAYMENT_REJECTED`).
- **Log Transaksi** pada halaman detail: timeline gabungan event lifecycle order
  (dibuat / dibayar / kedaluwarsa, diturunkan dari timestamp order) + aksi admin dari
  `AuditLog`, terurut terbaru lebih dulu.

#### 6.11.6 Manajemen Voucher

- Tiga halaman: **daftar** (`/admin/vouchers`), **buat** (`/admin/vouchers/new`),
  dan **edit** (`/admin/vouchers/[voucherId]/edit`).
- **Daftar** menampilkan **hanya voucher buatan admin** (`isSystemGenerated = false`);
  voucher hadiah gamifikasi (`NLA-LV…`) dikelola oleh mesin EXP dan **disembunyikan** di sini.
  Kolom: ID (8 char terakhir), Kode, Deskripsi (opsional), Diskon, Pemakaian
  (`usageCount / maxUsage`, ∞ bila tak terbatas), Berlaku s/d (endDate, DD/MM/YYYY WIB),
  Status, dan aksi **Edit** (satu-satunya aksi di tabel).
- **Search** by kode (insensitive), **sort** by pemakaian (terbanyak/tersedikit) atau
  tanggal berlaku (terdekat/terlama), dan **filter status**. State tersimpan di URL.
- **Status diturunkan** (badge & filter): **Terjadwal** (startDate masih di masa depan),
  **Aktif**, **Nonaktif** (`isActive=false`), **Kedaluwarsa** (lewat endDate),
  **Habis** (`usageCount ≥ maxUsage`). Presedensi: nonaktif → terjadwal → kedaluwarsa →
  habis → aktif.
- **Tipe diskon: persen ATAU nominal rupiah** (`Voucher.discountType` = `PERCENTAGE | FIXED`).
  PERCENTAGE menyimpan `discountPct` (1–100); FIXED menyimpan `discountAmount` (rupiah).
  Diskon dihitung oleh helper bersama `computeVoucherDiscount` dan dihormati penuh di checkout
  (preview + saat order dibuat). Voucher hadiah gamifikasi selalu PERCENTAGE.
- **Form Buat/Edit**: Kode (unik, case-sensitive, charset `[A-Za-z0-9_-]`), Deskripsi
  (opsional), Tipe + nilai diskon, Batas pemakaian (opsional; kosong = tak terbatas),
  Tanggal & waktu mulai (**opsional** — kosong → aktif seketika saat dibuat) dan berakhir
  (wajib, harus di masa depan saat membuat). Waktu diinput dalam WIB lalu dikonversi ke UTC.
- **Nonaktifkan/Aktifkan** dan **Hapus** berada di **halaman Edit** (bukan aksi tabel).
  Nonaktifkan menyetel `isActive=false`. **Hapus diblokir (409)** bila voucher sudah pernah
  dipakai (ada `VoucherUsage`/`Order`) → admin diarahkan untuk menonaktifkan; hanya voucher
  yang belum pernah dipakai yang bisa dihapus permanen.
- Semua aksi tulis dikonfirmasi via dialog dan dicatat di `AuditLog`
  (`VOUCHER_CREATE` / `VOUCHER_UPDATE` / `VOUCHER_ACTIVATE` / `VOUCHER_DEACTIVATE` /
  `VOUCHER_DELETE`, beserta admin pelaku). Halaman Edit menampilkan jumlah pemakaian voucher.

#### 6.11.7 Manajemen Sertifikat _(implemented)_

- Halaman `/admin/certificates` — **read-only monitoring + lookup**. Tabel seluruh sertifikat yang
  diterbitkan: penerima (nama + email + avatar), kursus, tanggal terbit, nomor sertifikat, dan **status
  validitas** (Valid / Kedaluwarsa, diturunkan dari `expiresAt`). Dilengkapi pencarian (nomor / nama /
  email / kursus), filter status + kursus, urut tanggal terbit, dan pagination (10/halaman).
- **Aksi per-baris (non-destruktif):** unduh ulang PDF + buka halaman verifikasi publik (`/cert/:id`).
- **Konfigurasi global expiration** (panel "Pengaturan Sertifikat" di halaman ini): input jumlah tahun
  (kosong = no expiry), tersimpan di `platform_setting` key `CERTIFICATE_EXPIRY_YEARS` (dibaca
  `computeCertExpiry` saat klaim). **Non-retroaktif** — hanya memengaruhi sertifikat yang diterbitkan
  setelahnya; sertifikat lama tetap memakai `expiresAt` yang sudah ter-stamp. Disimpan lewat dialog
  konfirmasi + dicatat ke `AuditLog` (`CERT_EXPIRY_UPDATE`). _(Keputusan: ditempatkan di sini, bukan di
  §6.13 Pengaturan yang belum dibangun.)_
- Admin **tidak dapat mencabut/mengedit** sertifikat yang sudah diterbitkan (read-only untuk admin).

#### 6.11.8 Manajemen Gamifikasi

- Lihat daftar nilai EXP per aktivitas (read-only; nilai EXP dikonfigurasi di level backend).
- Lihat daftar dan konfigurasi badge (tambah, edit, hapus).
- Monitor data EXP dan level seluruh pengguna.
- Lihat log pemberian voucher reward.

**Manajemen Badge:**
Admin dapat melakukan CRUD badge dengan ketentuan:

- Tambah badge baru: isi Nama, Deskripsi, Trigger (pilih dari dropdown enum),
  Threshold (angka), EXP Minimum, dan upload Logo Badge.
- Edit badge: hanya Nama, Deskripsi, Threshold, EXP Minimum, dan Logo yang dapat
  diubah. Jenis trigger tidak dapat diubah setelah dibuat.
- Hapus badge: badge dapat dihapus; badge yang sudah diperoleh user tetap
  dipertahankan secara historis (tidak ikut terhapus).
- Jenis trigger baru hanya dapat ditambahkan oleh developer (perubahan kode backend).

**Trigger enum yang tersedia:**
| Trigger | Kondisi |
|---|--- |
| LEVEL_REACHED | User mencapai level tertentu |
| COURSES_COMPLETED | User menyelesaikan sejumlah kursus |
| COURSE_SPECIFIC | User menyelesaikan kursus tertentu |

**Status implementasi (`/admin/gamification`):**

- Halaman memakai **2 tab**: (1) **Aturan EXP** (read-only) menampilkan perolehan EXP
  per aksi (+15 video / +90 lulus kuis / +600 selesai kursus), progresi level
  `REQ(L)=744+124×(L-1)` + gelar (Beginner/Explorer/Scholar/Master), dan reward
  voucher (20/35/50% di level 5/10/15, berlaku 180 hari); (2) **Manajemen Badge**
  (CRUD penuh: tambah/edit/hapus).
- **Tambah/Edit badge** memakai **modal dialog**; trigger dikunci saat edit.
  COURSE_SPECIFIC memilih kursus (bukan threshold).
- **Kolom "EXP" = `Badge.expMinimum`** bersifat **informasi saja** — ditampilkan &
  dapat di-set admin, tetapi **tidak** memengaruhi engine pemberian EXP/badge.
- **Ikon badge**: picker bergaya pemilihan avatar — pilih preset (`public/badges/`),
  unggah ikon kustom (Bunny Storage, di-sign saat baca), atau tanpa ikon (memakai
  lambang default berbasis trigger). Ikon juga dirender di koleksi badge peserta didik.
- **Hapus badge** = hard delete; `UserBadge.badgeSnapshot` mempertahankan riwayat
  (`badgeId` di-`SetNull`). Aksi CRUD ditulis ke `AuditLog`.
- **Belum dibangun (ditunda):** monitor data EXP/level seluruh pengguna & log
  pemberian voucher reward — di luar 2 tab saat ini.

#### 6.11.9 Konfigurasi Magang

**Kelola Batch:**

- CRUD daftar batch/angkatan (contoh: Batch 1, Batch 2, Batch 3).
- Batch yang masih digunakan akun aktif tidak dapat dihapus.
- Batch tidak dapat dihapus setelah dibuat.
- Saat menambahkan Batch, Admin diwajibkan mengisi field Keterangan Batch (contoh: Batch 1 Periode November 2025 – Januari 2026), **Tanggal Mulai** dan **Tanggal Berakhir** magang (validasi: tanggal berakhir harus setelah tanggal mulai), dan mengonfirmasi pembuatan melalui popup konfirmasi.
- Tanggal Mulai/Berakhir menentukan rentang waktu magang batch & membatasi kalender absensi peserta (lihat §6.9.2 & §9.4).

**Pengaturan Tanggal Libur:**

- Admin mengelola daftar tanggal libur (global, berlaku semua batch — lihat §9.6.1).
- Menambah libur: klik "Set Tanggal Libur" → isi **tanggal mulai libur**, **jumlah hari**, dan **keterangan**. Rentang libur dihitung dari tanggal mulai sepanjang jumlah hari.
- CRUD daftar libur; libur tampil sebagai hari **Libur** di kalender absensi seluruh peserta magang.

**Kelola Bidang:**

- Admin menambahkan Bidang baru dengan memilih satu Batch yang dikaitkan dan mengisi nama Bidang (harus unik). Nama Bidang yang tersimpan otomatis digabung menjadi format: <Nama Batch> - <Nama Bidang> (contoh: Batch 1 - Web Programming).
- Bidang yang masih digunakan akun aktif tidak dapat dihapus.

**Kelola Kelas:**

- Admin menambahkan Kelas baru dengan memilih satu Bidang yang dikaitkan. Nama Kelas dibuat otomatis secara berurutan menggunakan abjad (A, B, C, dst.) berdasarkan ketersediaan kelas yang sudah ada pada Bidang tersebut. Nama akhir kelas mengikuti format: <Nama Bidang> - <Huruf Kelas> (contoh: Batch 1 - Web Programming - A).
- Kelas yang masih digunakan akun aktif tidak dapat dihapus.
- Maksimal 10 Peserta Magang per kelas.

**Rekap Absensi:**

- Lihat rekap absensi seluruh peserta magang.
- Edit status absensi secara manual per peserta per hari (Tidak Hadir/Hadir).
- Filter berdasarkan batch, bidang, kelas, dan rentang tanggal.

**Rekap Tugas:**

- Lihat seluruh tugas yang dibuat mentor.
- Lihat detail tugas dan status pengumpulan tugas per peserta.

**Nilai Akhir:**

- Lihat nilai akhir seluruh peserta magang (read-only untuk admin).

#### 6.11.10 Konfigurasi Platform

- Konfigurasi sertifikat global (expiration date setting).
- Konfigurasi email transaksional (Resend API Key).

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Aspek                          | Target                                            |
| ------------------------------ | ------------------------------------------------- |
| Largest Contentful Paint (LCP) | < 2.5 detik                                       |
| First Input Delay (FID)        | < 100ms                                           |
| Cumulative Layout Shift (CLS)  | < 0.1                                             |
| API Response Time (P95)        | < 500ms untuk endpoint umum                       |
| Video Start Time               | < 3 detik (bergantung koneksi, via Bunny.net CDN) |

### 7.2 Reliability

- Uptime target: **99.5%** per bulan.
- Graceful error handling: setiap error ditampilkan sebagai pesan yang ramah pengguna, bukan raw error.
- Webhook payment gateway (Midtrans) harus memiliki retry mechanism (handled by payment gateway; backend harus idempotent).

### 7.3 Scalability

- Arsitektur fullstack Next.js (App Router + Route Handlers) memungkinkan deployment terpadu namun tetap terstruktur dengan pemisahan logika yang jelas antara frontend dan API layer.
- Database query dioptimalkan dengan indexing pada kolom yang sering diquery (user_id, course_id, status, created_at).
- Video hosting via Bunny.net CDN untuk distribusi konten yang efisien.

### 7.4 Maintainability

- Kode mengikuti konvensi yang konsisten (ESLint + Prettier).
- Prisma migrations digunakan untuk seluruh perubahan schema database.
- Environment variables untuk seluruh konfigurasi sensitif.
- Logging pada Next.js Route Handlers (request log, error log, webhook log).

### 7.5 Accessibility

- Kontras warna memenuhi standar WCAG 2.1 AA.
- Semua gambar memiliki atribut `alt`.
- Form memiliki label yang jelas dan error message yang deskriptif.
- Keyboard navigable untuk elemen interaktif utama.

### 7.6 Lokalisasi

- Bahasa UI: **Bahasa Indonesia**.
- Format tanggal: **DD/MM/YYYY**.
- Format mata uang: **IDR** (Rupiah), tampilkan dengan format `Rp 1.000.000`.
- Timezone: **WIB (UTC+7)** — hardcoded, tidak ada pilihan timezone lain.
- Tidak ada rencana multi-bahasa untuk v1.0.

---

## 8. Tech Stack & Architecture

### 8.1 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
                       │
              ┌────────▼────────┐
              │   Next.js App   │
              │  (Fullstack)    │
              │  Port: 3000     │
              │                 │
              │  ┌───────────┐  │
              │  │  Frontend │  │
              │  │ (App Dir) │  │
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │  Backend  │  │
              │  │  (Route   │  │
              │  │ Handlers) │  │
              │  └───────────┘  │
              └────────┬────────┘
                       │
       ┌───────────────┼─────────────────┐
       │               │                 │
┌──────▼──────┐ ┌──────▼──────┐  ┌──────▼──────┐
│  Supabase   │ │  Bunny.net  │  │  Midtrans   │
│ (PostgreSQL)│ │ (Video CDN) │  │  (Payment)  │
└─────────────┘ └─────────────┘  └─────────────┘
```

### 8.2 Tech Stack

| Layer                | Teknologi                | Versi/Keterangan                          |
| -------------------- | ------------------------ | ----------------------------------------- |
| **Framework**        | Next.js + TypeScript     | App Router — Fullstack (Frontend+Backend) |
| **Styling**          | Tailwind CSS + shadcn/ui | —                                         |
| **Data Fetching**    | TanStack Query           | Client-side caching & server state        |
| **Database**         | Supabase (PostgreSQL)    | Managed PostgreSQL via Supabase           |
| **ORM**              | Prisma                   | Schema-first, migrations                  |
| **Authentication**   | Better Auth              | Sessions                                  |
| **Video Hosting**    | Bunny.net                | Stream + Signed URLs                      |
| **Payment Gateway**  | Midtrans                 | Webhook-based                             |
| **Email**            | Resend + React Email     | Transactional email, tanpa queue          |
| **Input Validation** | Zod                      | Frontend & Backend (Route Handlers)       |
| **Testing**          | Playwright + Blackbox    | E2E + manual                              |
| **Deployment**       | VPS                      | —                                         |

### 8.3 Keputusan Arsitektur

| Keputusan                          | Alasan                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| Next.js Fullstack (bukan terpisah) | Simplifikasi deployment dan codebase untuk MVP; API Route Handlers menggantikan Express server     |
| REST API (bukan GraphQL/tRPC)      | Lebih familiar, mudah di-debug, cukup untuk kebutuhan v1.0                                         |
| Supabase (PostgreSQL)              | Managed database dengan koneksi PostgreSQL standar; kompatibel penuh dengan Prisma                 |
| Prisma ORM                         | Type-safe query, auto-migration, developer experience yang baik                                    |
| Bunny.net (bukan S3+CloudFront)    | Lebih terjangkau, CDN built-in, video streaming support, signed URL support                        |
| Resend + React Email               | API email modern, template berbasis React/JSX, deliverability tinggi; menggantikan Nodemailer+SMTP |
| Midtrans                           | Payment gateway lokal Indonesia dengan dukungan metode pembayaran yang lengkap                     |
| TanStack Query                     | Manajemen server state, caching, dan data fetching yang robust di sisi client                      |
| Better Auth                        | Fitur lengkap (session, email verification) dengan implementasi yang mudah                         |
| Nodemailer/BullMQ/Redis ditunda    | Over-engineering untuk MVP; Resend sudah cukup tanpa queue untuk volume awal                       |

---

## 9. Data Models

> Berikut adalah representasi logis dari entitas utama. Implementasi menggunakan Prisma schema dengan koneksi ke Supabase (PostgreSQL).

### 9.1 User

```
User {
  id              UUID (PK)
  email           String (unique)
  emailVerified   Boolean
  name            String
  username        String (unique, nullable)
  passwordHash    String (nullable — null jika social login)
  role            Enum: PESERTA_DIDIK | PESERTA_MAGANG | MENTOR | ADMINISTRATOR
  avatarUrl       String (nullable)
  bio             String (nullable)
  isActive        Boolean (default: true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### 9.2 InternshipProfile (untuk Peserta Magang)

```
InternshipProfile {
  id          UUID (PK)
  userId      UUID (FK → User, unique)
  classId     UUID (FK → Class)
  institution String (nullable)
}
```

### 9.3 MentorProfile (untuk Mentor)

```
MentorProfile {
  id      UUID (PK)
  userId  UUID (FK → User, unique)
  classId UUID (FK → Class)
}
```

### 9.4 Batch

```
Batch {
  id          UUID (PK)
  name        String (unique, contoh: Batch 1, Batch 2)
  description String (keterangan batch, contoh: Periode November 2025 – Januari 2026)
  startDate   DateTime (tanggal mulai magang batch, WIB — wajib saat pembuatan)
  endDate     DateTime (tanggal berakhir magang batch, WIB — wajib, harus > startDate)
  createdAt   DateTime
}
```

`startDate`/`endDate` mendefinisikan rentang waktu magang satu angkatan: menjadi acuan periode program dan membatasi kalender absensi Peserta Magang (bulan & tanggal pertama–terakhir yang dapat dinavigasi). Seluruh Bidang & Kelas di bawah Batch mewarisi periode ini.

### 9.5 Field

```
Field {
  id        UUID (PK)
  batchId   UUID (FK → Batch)
  name      String (unique, nama tampilan gabungan, contoh: Batch 1 - Web Programming)
  createdAt DateTime
}
```

### 9.6 Class

```
Class {
  id          UUID (PK)
  fieldId     UUID (FK → Field)
  name        String (nama tampilan mengikuti format: <Nama Bidang> - <Huruf Kelas>, contoh: Batch 1 - Web Programming - A)
  maxStudents Integer (kapasitas maksimal peserta per kelas, default 10)
  createdAt   DateTime
  updatedAt   DateTime
}
```

#### 9.6.1 Holiday (Tanggal Libur)

Daftar tanggal libur yang dikonfigurasi Admin. **Global** — berlaku untuk semua batch (tidak punya `batchId`). Hari yang masuk rentang libur ditandai **Libur** di kalender absensi (di luar Sabtu/Minggu yang sudah otomatis libur) dan tidak dihitung sebagai Tidak Hadir.

```
Holiday {
  id          UUID (PK)
  startDate   DateTime (hari pertama libur, WIB)
  days        Integer  (jumlah hari libur, ≥ 1, default 1)
  endDate     DateTime (turunan = startDate + days - 1; disimpan untuk query rentang "apakah tanggal X libur")
  description String   (keterangan, contoh: "Cuti Bersama Idul Adha")
  createdAt   DateTime
  updatedAt   DateTime
}
```

Admin menambah libur dengan mengisi: tanggal mulai libur, jumlah hari, dan keterangan; `endDate` dihitung otomatis saat penyimpanan.

### 9.7 Course

```
Course {
  id            UUID (PK)
  title         String
  slug          String (unique)
  description   Text
  categoryId    UUID (FK → Category)
  thumbnailUrl  String
  price         Integer (IDR, dalam rupiah)
  fakePrice     Integer (IDR, dalam rupiah) // harga dicoret saat ditampilkan
  estimatedDuration Integer (nullable — dalam menit, diisi manual oleh admin)
  instructor    String
  instructorBio String
  instructorImg String
  status        Enum: DRAFT | PUBLISHED | ARCHIVED   ← ganti isPublished
  isFeatured    Boolean (default false)
  createdAt     DateTime
  updatedAt     DateTime
  publishedAt   DateTime (nullable — di-stamp saat transisi pertama ke PUBLISHED; kolom "Tanggal Publish" di admin §6.11.3)
}
```

```
Category {
  id        UUID (PK)
  name      String (kategori: Multimedia, Web Programming, dll.)
  createdAt DateTime
  updatedAt DateTime
}
```

### 9.8 Sprint & Step

```
Sprint {
  id       UUID (PK)
  courseId UUID (FK → Course)
  title    String
  order    Integer
}

Step {
  id          UUID (PK)
  sprintId    UUID (FK → Sprint)
  title       String
  type        Enum: VIDEO | QUIZ
  order       Integer
  description Text        // ditampilkan di Overview / Deskripsi Materi
}
```

### 9.9 Video & Quiz

```
Video {
  id          UUID (PK)
  stepId      UUID (FK → Step, unique)
  bunnyVideoId String                  // identitas utama untuk kelola/hapus via Bunny API
  duration    Integer (detik, default 0)  // terisi dari webhook Bunny saat encoding selesai
  status      Enum: PROCESSING | READY | FAILED (default PROCESSING)
  videoUrl    String (nullable)        // CDN HLS playback URL (metadata; player pakai signed iframe embed)
}
// Alur upload (admin §6.11.3): file diunggah LANGSUNG dari browser ke Bunny via TUS
// (server hanya membuat objek video + menandatangani upload), Video disimpan status
// PROCESSING, lalu webhook Bunny (`/api/webhooks/bunny`) men-set READY + duration + videoUrl.

Quiz {
  id          UUID (PK)
  stepId      UUID (FK → Step, unique)
  passingScore Integer (default: 80)
}

QuizQuestion {
  id               UUID (PK)
  quizId           UUID (FK → Quiz)
  question         String (nullable — null jika soal berupa gambar)
  questionImageUrl String (nullable — URL gambar soal, jika ada)
  options          JSON (array of strings)
  answer           Integer (index jawaban benar)
  order            Integer
}
```

### 9.10 Enrollment & Progress

```
Enrollment {
  id        UUID (PK)
  userId    UUID (FK → User)
  courseId  UUID (FK → Course)
  enrolledAt DateTime
  completedAt DateTime (nullable)
  progressPct Float (0.0 – 100.0)
}

StepProgress {
  id          UUID (PK)
  enrollmentId UUID (FK → Enrollment)
  stepId      UUID (FK → Step)
  isCompleted Boolean
  completedAt DateTime (nullable)
  quizScore   Float (nullable — hanya untuk step quiz)
  quizAttempts Integer (default: 0)
  cooldownUntil DateTime (nullable)
}
```

### 9.11 Transaction & Order

```
Order {
  id            UUID (PK)
  userId        UUID (FK → User)
  courseId      UUID (FK → Course)
  voucherId     UUID (FK → Voucher, nullable)
  originalPrice Integer
  discountAmount Integer
  finalPrice    Integer
  status        Enum: PENDING | SUCCESS | FAILED | EXPIRED
  paymentInvoiceId String (nullable — ID invoice dari Midtrans)
  paymentMethod String (nullable)
  expiresAt     DateTime
  paidAt        DateTime (nullable)
  createdAt     DateTime
}
```

### 9.12 Certificate

```
Certificate {
  id             UUID (PK)
  userId         UUID (FK → User)
  courseId       UUID (FK → Course)
  enrollmentId   UUID (FK → Enrollment, unique)
  certificateNo  String (unique) — format: NLA-YYYYMMDD-XXXXXXXX
  issuedAt       DateTime
  expiresAt      DateTime (nullable)
  pdfUrl         String (nullable — path file PDF)
}
```

### 9.13 Voucher

```
Voucher {
  id              UUID (PK)
  code            String (unique)
  description     String (nullable)
  discountPct     Integer (1–100)
  startDate       DateTime
  endDate         DateTime
  maxUsage        Integer (nullable)
  usageCount      Integer (default: 0)
  maxUsagePerUser Integer (default: 1)
  allowedRole     Enum: ALL (nullable)
  allowedCategory UUID (FK → Category, nullable)
  allowedUserId   UUID (nullable)
  allowedCourseId UUID (FK → Course, nullable)
  isActive        Boolean
  isSystemGenerated Boolean (membedakan reward vs manual)
  createdAt       DateTime
}

VoucherUsage {
  id        UUID (PK)
  voucherId UUID (FK → Voucher)
  userId    UUID (FK → User)
  orderId   UUID (FK → Order)
  usedAt    DateTime
}
```

### 9.14 Gamification

```
Badge {
  id          UUID (PK)
  name        String
  description String (nullable)
  trigger     Enum: LEVEL_REACHED | COURSES_COMPLETED | COURSE_SPECIFIC
  threshold   Integer (makna tergantung trigger: nomor level / jumlah kursus / course ID)
  courseId    UUID (FK → Course, nullable — hanya diisi jika trigger = COURSE_SPECIFIC)
  expMinimum  Integer (default: 0)
  logoUrl     String (nullable)
  createdAt   DateTime
}

UserBadge {
  id           UUID (PK)
  userId       UUID (FK → User)
  badgeId      UUID (FK → Badge)
  badgeSnapshot String (snapshot nama badge saat diperoleh, untuk jaga historis jika badge dihapus)
  earnedAt     DateTime
}

UserGameProfile {
  id        UUID (PK)
  userId    UUID (FK → User, unique)
  exp       Integer (EXP dalam level saat ini, reset tiap naik level)
  level     Integer (default: 1)
  totalExp  Integer (akumulasi EXP sepanjang waktu, tidak reset)
  updatedAt DateTime
}

ExpLog {
  id        UUID (PK)
  userId    UUID (FK → User)
  amount    Integer
  source    Enum: VIDEO_COMPLETE | QUIZ_PASS | COURSE_COMPLETE
  refId     UUID (ID step atau course yang jadi sumber)
  createdAt DateTime
}
```

### 9.15 Internship — Attendance

```
Attendance {
  id        UUID (PK)
  userId    UUID (FK → User)
  date      Date
  status    Enum: PRESENT | ABSENT
  checkedInAt DateTime (nullable)
  editedBy  UUID (FK → User, nullable — admin yang edit)
  createdAt DateTime
}
```

### 9.16 Internship — Task

```
Task {
  id          UUID (PK)
  mentorId    UUID (FK → User)
  batchId     UUID (FK → Batch)
  fieldId     UUID (FK → Field)
  classId     UUID (FK → Class)
  title       String
  description Text
  attachmentUrl String (nullable — satu file atau satu tautan URL)
  deadline    DateTime
  createdAt   DateTime
}

TaskSubmission {
  id           UUID (PK)
  taskId       UUID (FK → Task)
  studentId    UUID (FK → User)
  submissionUrl String (nullable — file atau link)
  notes        String (nullable)
  status       Enum: NOT_SUBMITTED | SUBMITTED
  feedbackText String (nullable)
  reviewedAt   DateTime (nullable)
  submittedAt  DateTime
  updatedAt    DateTime
}
```

### 9.17 Internship — Final Grade

```
FinalGrade {
  id           UUID (PK)
  studentId    UUID (FK → User, unique)
  mentorId     UUID (FK → User)
  grade        Integer (0–100, nullable)
  gradedAt     DateTime (nullable)
  lastEditedBy UUID (FK → User, nullable — diisi jika admin yang mengubah)
  updatedAt    DateTime
}
```

### 9.18 Notification

```
Notification {
  id        UUID (PK)
  userId    UUID (FK → User)
  title     String
  message   String
  type      String (TASK_ASSIGNED | TASK_FEEDBACK | dll.)
  refId     UUID (nullable — ID entitas terkait)
  isRead    Boolean (default: false)
  createdAt DateTime
}
```

### 9.19 Better-Auth Session

```
Session {
  id        String (PK)
  userId    UUID (FK → User)
  token     String (unique)
  expiresAt DateTime
  ipAddress String (nullable)
  userAgent String (nullable)
  createdAt DateTime
  updatedAt DateTime
}
```

### 9.20 Platform Settings

```
PlatformSetting {
  id        UUID (PK)
  key       String (unique)
  value     String
  updatedAt DateTime
  updatedBy UUID (FK → User, nullable)
}
```

---

## 10. API Structure Overview

Seluruh API endpoint menggunakan prefix `/api/v1/`, diimplementasikan sebagai Next.js Route Handlers di `app/api/v1/`.

### 10.1 Auth

| Method | Endpoint                | Deskripsi                  | Auth   |
| ------ | ----------------------- | -------------------------- | ------ |
| POST   | `/auth/register`        | Registrasi peserta didik   | Public |
| POST   | `/auth/login`           | Login email+password       | Public |
| POST   | `/auth/logout`          | Logout                     | Auth   |
| GET    | `/auth/me`              | Get current user           | Auth   |
| POST   | `/auth/verify-email`    | Verifikasi email via token | Public |
| POST   | `/auth/forgot-password` | Request reset password     | Public |
| POST   | `/auth/reset-password`  | Reset password via token   | Public |

### 10.2 Courses (Public)

| Method | Endpoint         | Deskripsi                                  | Auth   |
| ------ | ---------------- | ------------------------------------------ | ------ |
| GET    | `/courses`       | Daftar kursus (search, filter, pagination) | Public |
| GET    | `/courses/:slug` | Detail kursus                              | Public |

### 10.3 Courses (Authenticated)

| Method | Endpoint                                          | Deskripsi                 | Auth |
| ------ | ------------------------------------------------- | ------------------------- | ---- |
| GET    | `/my-courses`                                     | Kursus yang dimiliki user | Auth |
| GET    | `/my-courses/:courseId/progress`                  | Progres kursus user       | Auth |
| POST   | `/my-courses/:courseId/steps/:stepId/complete`    | Tandai step selesai       | Auth |
| POST   | `/my-courses/:courseId/steps/:stepId/quiz/submit` | Submit quiz               | Auth |

### 10.4 Orders & Payment

| Method | Endpoint             | Deskripsi                    | Auth                            |
| ------ | -------------------- | ---------------------------- | ------------------------------- |
| POST   | `/orders`            | Buat order baru              | Auth                            |
| GET    | `/orders`            | Riwayat transaksi user       | Auth                            |
| GET    | `/orders/:id`        | Detail order                 | Auth                            |
| POST   | `/vouchers/validate` | Validasi kode voucher        | Auth                            |
| POST   | `/webhooks/payment`  | Webhook dari Midtrans        | Public (validated by signature) |

### 10.5 Certificates

| Method | Endpoint                            | Deskripsi              | Auth   |
| ------ | ----------------------------------- | ---------------------- | ------ |
| GET    | `/certificates`                     | Daftar sertifikat user | Auth   |
| POST   | `/certificates/:enrollmentId/claim` | Klaim sertifikat       | Auth   |
| GET    | `/certificates/:id/download`        | Download PDF           | Auth   |
| GET    | `/verify/:certificateId`            | Verifikasi publik      | Public |

### 10.6 Gamification

| Method | Endpoint                | Deskripsi              | Auth |
| ------ | ----------------------- | ---------------------- | ---- |
| GET    | `/gamification/profile` | EXP, level, badge user | Auth |
| GET    | `/gamification/exp-log` | Riwayat perolehan EXP  | Auth |

### 10.7 Internship — Student

| Method | Endpoint                          | Deskripsi            | Auth           |
| ------ | --------------------------------- | -------------------- | -------------- |
| POST   | `/internship/attendance/check-in` | Check-in absensi     | PESERTA_MAGANG |
| GET    | `/internship/attendance`          | Riwayat absensi saya | PESERTA_MAGANG |
| GET    | `/internship/tasks`               | Daftar tugas saya    | PESERTA_MAGANG |
| GET    | `/internship/tasks/:id`           | Detail tugas         | PESERTA_MAGANG |
| POST   | `/internship/tasks/:id/submit`    | Kumpulkan tugas      | PESERTA_MAGANG |
| GET    | `/internship/final-grade`         | Lihat nilai akhir    | PESERTA_MAGANG |

### 10.8 Internship — Mentor

| Method | Endpoint                                          | Deskripsi                 | Auth   |
| ------ | ------------------------------------------------- | ------------------------- | ------ |
| GET    | `/mentor/students`                                | Daftar peserta bimbingan  | MENTOR |
| GET    | `/mentor/attendance`                              | Rekap absensi peserta     | MENTOR |
| GET    | `/mentor/tasks`                                   | Daftar tugas yang dibuat  | MENTOR |
| POST   | `/mentor/tasks`                                   | Buat tugas baru           | MENTOR |
| GET    | `/mentor/tasks/:id/submissions`                   | Submisi tugas per peserta | MENTOR |
| PATCH  | `/mentor/tasks/:taskId/submissions/:submissionId` | Cek tugas (kembalikan)    | MENTOR |
| GET    | `/mentor/grades`                                  | Daftar nilai akhir        | MENTOR |
| POST   | `/mentor/grades/:studentId`                       | Input/update nilai akhir  | MENTOR |

### 10.9 Admin

| Method    | Endpoint                       | Deskripsi                  | Auth  |
| --------- | ------------------------------ | -------------------------- | ----- |
| GET       | `/admin/dashboard`             | Analytics data             | ADMIN |
| CRUD      | `/admin/courses`               | Kelola kursus              | ADMIN |
| CRUD      | `/admin/courses/:id/sprints`   | Kelola sprint              | ADMIN |
| CRUD      | `/admin/sprints/:id/steps`     | Kelola tahap               | ADMIN |
| CRUD      | `/admin/users`                 | Kelola pengguna            | ADMIN |
| CRUD      | `/admin/vouchers`              | Kelola voucher             | ADMIN |
| GET/PATCH | `/admin/transactions`          | Kelola transaksi           | ADMIN |
| GET       | `/admin/certificates`          | Monitor sertifikat         | ADMIN |
| GET       | `/admin/certificates:id`       | Monitor sertifikat         | ADMIN |
| GET       | `/admin/gamification/leveling` | Monitor leveling           | ADMIN |
| CRUD      | `/admin/gamification/badges`   | Kelola badge               | ADMIN |
| GET/PATCH | `/admin/internship/attendance` | Rekap & edit absensi       | ADMIN |
| CRUD      | `/admin/internship/batches`    | Kelola batch (+ tanggal mulai/berakhir) | ADMIN |
| CRUD      | `/admin/internship/holidays`   | Kelola tanggal libur (global) | ADMIN |
| GET       | `/admin/internship/tasks`      | Monitor tugas              | ADMIN |
| GET/PATCH | `/admin/internship/grades`     | Monitor & edit nilai akhir | ADMIN |
| CRUD      | `/admin/settings`              | Konfigurasi platform       | ADMIN |

---

## 11. Security Requirements

### 11.1 Authentication & Authorization

- Seluruh route yang memerlukan login diproteksi dengan middleware autentikasi.
- Role-based access control (RBAC) diterapkan di level middleware backend.
- Session menggunakan HTTP-only cookie (tidak bisa diakses via JavaScript).
- Token-based verification untuk email dan reset password (satu kali pakai, ada expiry).

### 11.2 Input Validation

- **Frontend:** Zod schema validation sebelum request dikirim.
- **Backend:** Zod schema validation di setiap endpoint (tidak bergantung pada validasi frontend).
- Sanitasi input untuk mencegah XSS pada konten yang dirender sebagai HTML.
- Prisma ORM mencegah SQL Injection secara default melalui parameterized queries.

### 11.3 Rate Limiting

| Endpoint                     | Limit                                        |
| ---------------------------- | -------------------------------------------- |
| POST `/auth/login`           | 5 percobaan gagal per 15 menit per IP        |
| POST `/auth/register`        | 10 per jam per IP                            |
| POST `/auth/forgot-password` | 3 per jam per IP                             |
| POST `/webhooks/payment`     | Tidak di-rate-limit (validated by signature) |
| Endpoint umum                | 200 request per menit per IP                 |

### 11.4 Video Protection (Bunny.net)

- Video tidak dapat diakses langsung via URL publik.
- Setiap permintaan video menggunakan **Signed URL** dengan expiry waktu singkat (misal: 15 menit).
- Backend memverifikasi kepemilikan kursus sebelum menerbitkan Signed URL.
- User yang tidak memiliki kursus tidak dapat mendapatkan Signed URL untuk video kursus tersebut.

### 11.5 Payment Security

- Webhook dari Midtrans divalidasi menggunakan signature/token header sesuai dokumentasi masing-masing payment gateway.
- Backend idempotent: order yang sudah `SUCCESS` tidak akan diproses ulang meski webhook diterima lebih dari sekali.
- Seluruh transaksi dicatat dengan timestamp dan IP log.

### 11.6 Secrets Management

- Seluruh API key (Midtrans, Bunny.net, Resend, Supabase) disimpan di environment variables.
- Tidak ada hardcoded secret di kode sumber.
- `.env` tidak di-commit ke version control (`.gitignore`).

### 11.7 HTTPS

- Seluruh komunikasi wajib menggunakan HTTPS.
- Redirect otomatis dari HTTP ke HTTPS di level server/reverse proxy.

### 11.8 Audit Log (Admin Panel)

- Seluruh aksi Admin yang bersifat destructive atau kritis (hapus user, ubah status transaksi, edit absensi) dicatat dalam audit log.

---

## 12. UI/UX Design Guidelines

### 12.1 Brand Colors

| Token            | Hex       | Penggunaan                                     |
| ---------------- | --------- | ---------------------------------------------- |
| `primary`        | `#478EF4` | CTA utama, link aktif, progress bar, highlight |
| `secondary`      | `#F4D600` | Aksen, badge, highlight sekunder               |
| `background`     | `#FFFFFF` | Background umum (light mode)                   |
| `text-primary`   | `#1A1A2E` | Teks utama                                     |
| `text-secondary` | `#6B7280` | Teks sekunder, placeholder                     |
| `success`        | `#22C55E` | Status berhasil, hadir                         |
| `error`          | `#EF4444` | Status gagal, error, tidak hadir               |
| `warning`        | `#F59E0B` | Status pending, peringatan                     |

### 12.2 Dark Mode

| Halaman       | Dark Mode       |
| ------------- | --------------- |
| Landing Page  | ❌ Light only   |
| Learning Page | ✅ Light + Dark |
| Admin Panel   | ✅ Light + Dark |
| Mentor Pages  | ✅ Light + Dark |

Toggle dark/light mode tersedia di navbar pada halaman yang mendukungnya. Preferensi disimpan di `localStorage`.

### 12.3 Typography

- Font: **POPPINS** (atau font sans-serif modern yang setara).
- Heading: bold, size scale konsisten (h1–h4).

### 12.4 Design Language

- **Landing Page:** Desain modern dan impresif. Menggunakan elemen 3D icons/objects, animasi scroll (reveal animations), transisi halus, hover effects, dan carousel. Tone: aspiratif dan profesional.
- **Learning Page:** Clean dan fokus. Desain tidak boleh mengganggu konsentrasi belajar. Sidebar rapi, area konten luas.
- **Admin Panel:** Dashboard-style yang informatif. Tabel yang readable, form yang jelas, aksi yang accessible.

### 12.5 Responsiveness

- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px).
- Landing page: optimal di semua breakpoint.
- Learning page: pada mobile, sidebar dapat di-collapse/toggle.
- Admin panel: minimal md breakpoint optimal; mobile sebagai tambahan.
- Course player pada mobile: video di atas, sidebar (sprint list) di bawah sebagai accordion.

### 12.6 Component Patterns

| Komponen        | Catatan                                             |
| --------------- | --------------------------------------------------- |
| Button          | Primary, Secondary, Ghost, Destructive variants     |
| Form Input      | Label di atas, error message di bawah field (merah) |
| Modal/Dialog    | Untuk konfirmasi aksi kritis dan checkout           |
| Toast/Snackbar  | Feedback aksi singkat (berhasil, gagal)             |
| Progress Bar    | Untuk progres kursus dan EXP level                  |
| Badge           | Rounded pill, warna per status                      |
| Sidebar         | Collapsible pada mobile                             |
| Table           | Sortable, filterable, dengan pagination             |
| Skeleton Loader | Untuk state loading konten                          |

### 12.7 Empty States

Setiap halaman yang bisa kosong harus memiliki empty state yang informatif:

- Ilustrasi kecil + teks deskriptif.
- CTA yang relevan (misalnya: "Lihat Katalog Kursus" di halaman "Kursus Saya" jika kosong).

### 12.8 Loading States

- Skeleton loader untuk konten yang di-fetch dari API.
- Spinner/disabled state pada tombol saat aksi sedang diproses.
- Tidak boleh ada halaman yang blank saat loading.

---

## 13. Email Notification Templates

Seluruh email menggunakan template React Email yang konsisten dengan branding NextLevel Academy, dikirim via Resend.

| Email                    | Subject                                      | Konten Utama                                                 |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| Verifikasi Email         | "Verifikasi Email Anda — NextLevel Academy"  | Tombol verifikasi + link teks + expired info                 |
| Reset Password           | "Reset Password — NextLevel Academy"         | Tombol reset + link teks + valid 1 jam                       |
| Password Berhasil Diubah | "Password Anda Telah Diubah"                 | Notifikasi + CTA hubungi support jika bukan kamu             |
| Konfirmasi Checkout      | "Menunggu Pembayaran — [Nama Kursus]"        | Ringkasan order, jumlah bayar, instruksi, countdown 60 menit |
| Pembayaran Berhasil      | "Selamat! Kursus Anda Aktif — [Nama Kursus]" | Konfirmasi, tombol "Mulai Belajar"                           |
| Pengingat Sertifikat     | "Kursus Selesai! Klaim Sertifikat Anda"      | Ajakan klaim, tombol klaim, info sertifikat                  |

---

## 14. Constraints & Decisions Log

| #   | Keputusan                                    | Alasan                                                                                 |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | No subscription model                        | Model bisnis one-time purchase lifetime access                                         |
| 2   | Tidak ada preview kursus gratis              | Keputusan bisnis; seluruh konten berbayar                                              |
| 3   | Tidak ada fitur News/Blog                    | Belum ada pengelola konten; bukan prioritas v1.0                                       |
| 4   | GitHub social login dihapus                  | Tidak relevan untuk target pasar umum Indonesia                                        |
| 5   | Akses kursus peserta magang via voucher 100% | Menggunakan infrastruktur voucher yang sudah ada; lebih simpel                         |
| 6   | Durasi magang tidak dikelola sistem          | Dikelola manual di luar platform; tidak perlu automasi                                 |
| 7   | Landing page light mode only                 | Konsistensi desain marketing; dark mode mengganggu visual konten promosi               |
| 8   | BullMQ/Redis ditunda post-v1.0               | Over-engineering untuk MVP; Resend sudah cukup tanpa queue untuk volume awal           |
| 9   | Tidak ada refund otomatis                    | Kebijakan bisnis; dispute ditangani manual oleh admin                                  |
| 10  | EXP reset per level                          | Memberikan perasaan progres yang jelas per level                                       |
| 11  | Voucher reward hardcoded (20%, 35%, 50%)     | Simplifikasi v1.0; dapat dikonfigurasi di versi selanjutnya                            |
| 12  | Bahasa UI: Indonesia only                    | Target pasar Indonesia; tidak ada rencana internasionalisasi                           |
| 13  | Timezone hardcoded WIB                       | Platform khusus Indonesia; tidak ada kebutuhan multi-timezone                          |
| 14  | Next.js Fullstack (tanpa Express terpisah)   | Simplifikasi codebase dan deployment; Route Handlers cukup untuk kebutuhan v1.0        |
| 15  | Supabase sebagai database provider           | Managed PostgreSQL dengan koneksi standar; kompatibel penuh dengan Prisma ORM          |
| 16  | Resend + React Email (bukan Nodemailer+SMTP) | API email modern, template JSX, deliverability lebih terjamin, konfigurasi minimal     |
| 17  | Midtrans                                     | Payment gateway lokal Indonesia; dukungan metode pembayaran lengkap untuk pasar ID     |
| 18  | TanStack Query untuk data fetching           | Manajemen server state dan caching yang robust; sinergi baik dengan Next.js App Router |

---

## 15. Out of Scope (v1.0)

Fitur-fitur berikut **tidak termasuk** dalam v1.0 dan dapat dipertimbangkan untuk versi selanjutnya:

| Fitur                                             | Alasan Tidak Masuk v1.0                      |
| ------------------------------------------------- | -------------------------------------------- |
| Live chat / support in-app                        | Digantikan oleh redirect ke WhatsApp         |
| Forum diskusi per kursus                          | Kompleksitas tinggi, belum prioritas         |
| News / Blog                                       | Belum ada pengelola konten                   |
| Notifikasi push browser                           | Dapat ditambahkan post-launch                |
| BullMQ + Redis (email queue)                      | Belum diperlukan untuk volume MVP            |
| Konfigurasi % voucher reward per level oleh admin | Hardcoded untuk v1.0                         |
| Multi-bahasa (i18n)                               | Target Indonesia only                        |
| Mobile app (iOS/Android)                          | Web-first; mobile app sebagai future roadmap |
| Referral system                                   | Post-MVP                                     |
| Affiliate program                                 | Post-MVP                                     |

---

## 16. Glossary

| Istilah                     | Definisi                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **Sprint**                  | Unit pembelajaran dalam kursus; berisi beberapa Tahap.                                        |
| **Tahap / Step**            | Unit terkecil dalam kursus; bisa berupa Video atau Quiz.                                      |
| **EXP (Experience Points)** | Poin yang diperoleh dari aktivitas belajar; digunakan untuk naik level.                       |
| **Level**                   | Tingkatan pengguna dalam sistem gamifikasi; naik berdasarkan akumulasi EXP.                   |
| **Badge**                   | Penghargaan visual yang diperoleh dari pencapaian tertentu (level atau kursus selesai).       |
| **Enrollment**              | Kepemilikan akses user terhadap suatu kursus setelah pembelian berhasil.                      |
| **Voucher**                 | Kode diskon yang dapat digunakan saat checkout.                                               |
| **Signed URL**              | URL dengan token keamanan sementara untuk mengakses video di Bunny.net.                       |
| **Webhook**                 | Notifikasi HTTP yang dikirim Midtrans ke backend saat status pembayaran berubah.              |
| **Bidang**                  | Kategori keahlian/pekerjaan dalam sistem magang (contoh: Multimedia, Web Programming).        |
| **Kelas**                   | Sub-kelompok opsional dalam satu bidang magang untuk memisahkan peserta (contoh: Kelas A, B). |
| **Window Absensi**          | Rentang waktu yang dikonfigurasi admin dalam sehari di mana peserta magang dapat check-in.    |
| **PRD**                     | Product Requirements Document — dokumen ini.                                                  |
| **RBAC**                    | Role-Based Access Control — sistem kontrol akses berdasarkan peran pengguna.                  |
| **IDR**                     | Indonesian Rupiah — mata uang yang digunakan di platform.                                     |
| **WIB**                     | Waktu Indonesia Barat (UTC+7) — timezone yang digunakan di seluruh platform.                  |
| **CDN**                     | Content Delivery Network — jaringan distribusi konten untuk performa video yang optimal.      |
| **Soft Delete**             | Penghapusan data secara logis (data tetap ada di database, hanya ditandai sebagai dihapus).   |

---

## 17. SEO Friendly

- SEO Friendly dan terkelola baik untuk landing page
- Usahakan Landing Page NextLevel Academy memiliki metadata SEO dan mudah diakses oleh search engine
- Pastikan landing page memiliki struktur yang baik dan mudah dibaca oleh search engine

_Dokumen PRD ini mencakup seluruh spesifikasi v1.0 NextLevel Academy. Setiap perubahan scope setelah dokumen ini difinalisasi harus melalui proses change request yang didokumentasikan._

---

**Prepared for:** Development Team, Design Team, AI Builder  
**Platform:** NextLevel Academy  
**Version:** 1.0.0 — Full Release Scope
