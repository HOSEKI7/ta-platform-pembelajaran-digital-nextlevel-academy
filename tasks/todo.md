# Task: Layout & Dashboard Mentor — NextLevel Academy — SELESAI ✅

## Data layer
- [x] `src/lib/mentor-types.ts` — DTO client-safe
- [x] `src/lib/mentor-data-loader.ts` — loadMentorContext + loadMentorDashboard (server-only)

## Shell & navigasi (`src/components/mentor/`)
- [x] `mentor-sidebar-config.ts` — MENTOR_NAV_ITEMS (PRD 5.4)
- [x] `mentor-sidebar.tsx`
- [x] `mentor-class-chip.tsx`
- [x] `mentor-notifications-button.tsx`
- [x] `mentor-topbar.tsx`
- [x] `mentor-shell.tsx`
- [x] `mentor-empty-state.tsx`

## Dashboard view (`src/components/mentor/dashboard/`)
- [x] `mentor-hero.tsx`
- [x] `class-attendance-card.tsx`
- [x] `active-tasks-card.tsx`
- [x] `mentor-dashboard.tsx`

## Route group + halaman
- [x] `src/app/(mentor)/layout.tsx`
- [x] `src/app/(mentor)/mentor/dashboard/page.tsx`

## Akun uji
- [x] Extend `scripts/seed-internship-data.ts` (Syarif mentor) + run seed
- [x] `npx tsc --noEmit` + eslint clean

## Verifikasi (Playwright, login Syarif)
- [x] /mentor/dashboard render: hero greeting "Selamat pagi, Syarif", chip kelas A, live clock WIB, jendela "Belum dibuka".
- [x] Stat: 1 peserta · 4 tugas aktif · 2 menunggu review. Donut 0% (Belum 1). Tugas aktif list + progress.
- [x] 0 console error. Gate role OK (sesi non-mentor → redirect /).
