# Task: Perbaikan 2 error dashboard Peserta Magang — SELESAI ✅

Konteks temuan:
- Error 1 (next-themes `<script>`): React 19.2 `console.error` saat React *membuat* (bukan hydrate) skrip anti-FOUC next-themes di klien → hanya muncul saat remount ThemeProvider via Fast Refresh; **tak pernah di produksi**. next-themes 0.4.6 sudah terbaru.
- Error 2 (No QueryClient): artefak remount Fast Refresh yang sama; di fresh load query jalan normal.
- Bug nyata (reprodusibel 4×/load): bell magang memanggil `/api/student/notifications` (gated PESERTA_DIDIK) → 403.

Keputusan user: (1) ganti next-themes dgn provider kustom + skrip server-rendered, (2) perbaiki 403.

## A. Ganti next-themes → provider tema kustom
- [x] A1. Tulis ulang `src/components/providers/theme-provider.tsx` jadi provider mandiri + hook `useTheme` (tipe Theme/ResolvedTheme, sync localStorage, listener media system, sync antar-tab, matikan transition saat swap).
- [x] A2. Tambah skrip anti-FOUC inline (server-rendered) di `src/app/layout.tsx`.
- [x] A3. Reorder provider: `QueryProvider` → `ThemeProvider` → {children, Toaster} (memutus Error 2 secara struktural).
- [x] A4. Arahkan import `useTheme` di `theme-toggle.tsx` & `sonner.tsx` ke provider baru.
- [x] A5. `npm uninstall next-themes` (tak ada lagi yang mengimpornya).
- [x] A6. Hapus wrapper `ThemeProvider forcedTheme` mati di `(public)/layout.tsx` (no-op di next-themes nested); update komentar `force-light-theme.tsx`.

## B. Perbaiki 403 bell magang
- [x] B1. Buat `src/components/internship/internship-notifications-button.tsx` — bell empty-state statis, tanpa fetch.
- [x] B2. Pasang di `internship-topbar.tsx` (ganti NotificationsButton student).

## Verifikasi
- [x] `npx tsc --noEmit` + `npx eslint` file berubah — clean.
- [x] `npm run build` — sukses.
- [x] Dev (login magang): console internship dashboard **0 error/0 warning** (tanpa 403/QueryClient/script-tag); bell empty state OK; toggle dark↔light sinkron (html class + colorScheme + localStorage); landing light + 0 error.
- [x] Fast Refresh `theme-provider.tsx` → 0 warning (skenario pemicu Error 1 dulu) — confirmed gone.
