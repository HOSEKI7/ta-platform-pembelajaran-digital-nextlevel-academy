# Task: Halaman Buat Tugas Baru (Mentor) — /mentor/tasks/new — SELESAI ✅

## A. Dependency
- [x] Install `@tiptap/extension-image` + `@tiptap/extension-placeholder` (pin 3.23.2 agar peer cocok core)
- [x] Context7 cek API Tiptap v3 (extend Image addAttributes)

## B. Storage + rendering deskripsi
- [x] `bunny-storage.ts`: `uploadTaskImage`, `uploadTaskAttachment` + konstanta gambar
- [x] `src/lib/task-description.ts` (normalize+count + sign, server-only)
- [x] `rich-text-content.tsx` + `.task-prose` di globals.css
- [x] `internship-task-loader.ts`: sign deskripsi di detail
- [x] `task-detail-view.tsx`: render RichTextContent
- [x] seed: deskripsi → HTML `<p>`

## C. Editor + upload gambar
- [x] `task-description-editor.tsx` (maks 1 gambar, paste/drop/tombol)
- [x] `POST /api/mentor/tasks/images`

## D. Form + halaman + API create
- [x] `validators/mentor-tasks.ts`
- [x] `deadline-picker.tsx`
- [x] `create-task-view.tsx`
- [x] `(mentor)/mentor/tasks/new/page.tsx`
- [x] `use-create-task.ts`
- [x] `POST /api/mentor/tasks` (create + notif TASK_ASSIGNED, maks 1 gambar, WIB→UTC)

## E. Sambungkan tombol
- [x] `mentor-tasks-view.tsx`: Buat Tugas Baru → /mentor/tasks/new

## Verifikasi
- [x] tsc + lint bersih
- [x] Playwright: buat tugas teks (deadline 05/06 17:00 WIB), redirect ke list (Total 7), kalender disable tanggal lampau, deskripsi rich-text tampil di detail siswa (akun magang sekelas). Gambar/lampiran perlu env BUNNY_STORAGE_* (belum diuji unggah).
