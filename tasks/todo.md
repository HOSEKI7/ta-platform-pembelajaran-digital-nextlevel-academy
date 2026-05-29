# Task: Detail Tugas Mentor /mentor/tasks/[taskId] (+Edit/Hapus/Feedback) — SELESAI ✅

- [x] 1. Tipe di `mentor-types.ts` (MentorTaskDetail, MentorSubmissionRow, MentorTaskEditData)
- [x] 2. `task-description.ts`: `extractTaskImagePaths`
- [x] 3. Loader: `loadMentorTaskDetail`, `loadMentorTaskForEdit`
- [x] 4. Hooks `use-mentor-task-actions.ts` (delete/return/update)
- [x] 5. API PUT+DELETE `[taskId]/route.ts` + return `submissions/[studentId]/return/route.ts`
- [x] 6. Editor `initialHTML` prop
- [x] 7. Ekstrak `task-form.tsx` + ringkas `create-task-view.tsx`
- [x] 8. `edit-task-view.tsx`
- [x] 9. Detail: view + submissions-table + delete-dialog + return-feedback-dialog
- [x] 10. Pages: `[taskId]/page.tsx`, `[taskId]/edit/page.tsx`
- [x] 11. Verifikasi: tsc + lint bersih; Playwright (mentor Syarif): detail render (0 error), Beri Feedback→DIKEMBALIKAN + ringkasan turun, Edit prefill + PUT save (revert), Hapus modal→redirect→list 6 (test data terhapus). Gotcha: base-ui Button render={<a/>}/<Link/> butuh `nativeButton={false}`.
