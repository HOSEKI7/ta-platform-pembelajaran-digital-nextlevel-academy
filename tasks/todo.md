# Todo — Admin: Kelola Tugas Peserta Magang

Plan lengkap: `~/.claude/plans/frontend-design-frontend-design-buatlah-eager-floyd.md`

- [x] 1. Tipe & query helper `src/lib/admin-internship-tasks-query.ts`
- [x] 2. Loader `src/lib/admin-internship-tasks-loader.ts` (list, detail, edit)
- [x] 3. Write submission `src/lib/admin-task-submission-write.ts`
- [x] 4. Validasi `src/lib/validations/admin-task.ts`
- [x] 5. API GET list `/api/admin/internship/tasks`
- [x] 6. API PUT+DELETE `/api/admin/internship/tasks/[taskId]`
- [x] 7. API PATCH force status `.../[taskId]/submissions/[studentId]`
- [x] 8. API POST images `/api/admin/internship/tasks/images`
- [x] 9. Hooks `src/hooks/use-admin-tasks.ts`
- [x] 10. Tweak `task-form.tsx` + `task-description-editor.tsx` (prop imageUploadUrl)
- [x] 11. List page + view + table
- [x] 12. Detail page + view + submissions table + force-status dialog
- [x] 13. Edit page + view
- [x] 14. Update PRD §6.11.9.1 + Session History CLAUDE.md
- [x] 15. Verifikasi: tsc ✓, lint ✓ (0 error), dev run + Playwright (list/detail/force-toggle dua arah/edit) ✓

## Catatan verifikasi
- List render + badge Aktif/Overdue + filter + paginasi OK.
- Force SUBMITTED tanpa berkas → "tanpa berkas", tak crash, persisten (tx + AuditLog commit).
- Force NOT_SUBMITTED (reverse) → hero count 1/2 → 0/2, data seed dipulihkan.
- Edit page prefilled (judul/Tiptap/lampiran/tenggat) via TaskForm + route gambar admin.
- Tidak ada error di console (hanya log query Prisma dev).
- Tidak diuji manual (low-risk, kode terbukti): Delete (reuse logika mentor) & file-keep saat reverse pada submission ber-file (jaminan kode: branch update tak menyentuh submissionUrl).
