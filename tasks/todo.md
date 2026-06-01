# Perbaikan penamaan Bidang & Kelas (Admin Panel)

Keputusan user: **normalisasi data DB** (bukan hanya tampilan) + kolom gabungan
`[Batch] - [Bidang] - [Kelas]` di tabel Tugas/Nilai/Absensi **tetap**.

Akar masalah: nama tersimpan berprefix — `Field.name` = "Batch 1 - Web Programming",
`Class.name` = "Batch 1 - Web Programming - A". Target: `Field.name` polos
("Web Programming"), `Class.name` komposit dari variabel
("Batch 1 2026 - Web Programming - A").

## Tugas

- [x] Helper bersama `src/lib/internship-naming.ts` (`classLetter`, `internshipClassLabel`) — aman di server & client
- [x] Skrip migrasi `scripts/normalize-internship-names.ts` (idempotent, hapus duplikat-kosong)
- [x] Refactor loader admin pakai helper (build label dari variabel, tanpa strip):
  - [x] `admin-internship-attendance-loader.ts`
  - [x] `admin-internship-grades-loader.ts`
  - [x] `admin-internship-tasks-loader.ts` (3 titik)
  - [x] `admin-internship-config-loader.ts` (dedupe `classLetter`)
  - [x] `admin-internship-config-write.ts` (dedupe `classLetter`)
- [x] Dropdown filter Kelas → tampilkan huruf saja (`classLetter`):
  - [x] `admin-attendance-view.tsx`
  - [x] `admin-grades-view.tsx`
  - [x] `admin-tasks-view.tsx`
- [x] Tabel Pengguna: **hapus kolom Kelas**
  - [x] `users-table.tsx` (desktop + mobile + helper `ClassValue`)
  - [x] `admin-users-loader.ts` (buang `classLabel` dari list + rapikan join; perbaiki `loadClassOptions` label)
  - [x] `admin-users-query.ts` (buang `classLabel` dari `AdminUserRow`)
- [x] Perbaiki seed agar konsisten (field polos):
  - [x] `prisma/seed.ts`
  - [x] `scripts/seed-internship-data.ts`
- [x] Jalankan migrasi (applied + idempotent) + `tsc --noEmit` + lint (0 error)
- [x] Update PRD (§5/§6.11.4) + CLAUDE.md

## Hasil verifikasi
- DB ternormalisasi: Field "Web Programming", Class "Batch 1 2026 - Web Programming - A" (2 peserta/3 mentor/6 tugas terjaga); orphan kosong dibuang.
- `tsc --noEmit` bersih; eslint 0 error (hanya warning `watch()` benign pra-ada).
