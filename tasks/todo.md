# Todo — Admin: Kelola Nilai Akhir Peserta Magang

Plan: `~/.claude/plans/buatlah-halaman-manajemen-nilai-cuddly-acorn.md`

## Schema
- [x] Tambah `FINAL_GRADE_OVERRIDE` ke `enum NotificationType`

## Part A — Halaman Nilai Akhir Admin
- [x] A1 `src/lib/admin-internship-grades-query.ts`
- [x] A2 `src/lib/admin-internship-grades-loader.ts`
- [x] A3 `src/lib/validations/admin-final-grade.ts`
- [x] A4 `src/lib/admin-final-grade-write.ts`
- [x] A5 API GET `grades/route.ts` + PUT `grades/[studentId]/route.ts`
- [x] A6 `src/hooks/use-admin-grades.ts`
- [x] A7 `admin-grades-view.tsx` + `admin-grades-table.tsx` + `admin-grade-dialog.tsx`
- [x] A8 `src/app/(admin)/admin/internship/grades/page.tsx`

## Part B — Bell notifikasi mentor DB-backed
- [x] B1 API `mentor/notifications/route.ts` + `mark-all-read/route.ts`
- [x] B2 `src/hooks/use-mentor-notifications.ts` + `mentorKeys.notifications()`
- [x] B3 Rewrite `mentor-notifications-button.tsx`

## Docs
- [x] PRD §6.11.9.2 + §6.9.4 + §6.10.1
- [x] CLAUDE.md Session History

## Verifikasi
- [x] `prisma generate`; `tsc --noEmit` bersih; `eslint` file baru bersih
- [ ] **USER:** `npx prisma db push` (enum baru di Postgres) + restart dev server
- [ ] **USER:** uji manual admin grades + integritas mentorId + audit + notifikasi mentor

## Catatan
- `MentorProfile` tak punya `createdAt` → resolusi mentor pakai `orderBy: { id: "asc" }`.
- `setAdminFinalGrade` tolak 409 bila kelas tanpa mentor; edit existing tak ubah `mentorId`.
- Alasan admin hanya di `AuditLog FINAL_GRADE_OVERRIDE` (tanpa kolom baru).
- Bell mentor kini DB-backed (reuse loader student role-agnostic).
