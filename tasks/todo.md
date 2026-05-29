# Task: Fitur Absensi Mentor (`/mentor/attendance`) — SELESAI ✅

- [x] 1. `src/lib/mentor-query-keys.ts` (all + selfAttendanceMonth + studentAttendanceByDate)
- [x] 2. Rename pantau peserta → `student-attendance` (page + components folder + API + hook `use-mentor-student-attendance` + semua import path)
- [x] 3. Loader: `loadMentorAttendanceMonth`, `performMentorCheckIn`, `loadMentorDashboard`→`selfAttendance`
- [x] 4. Tipe `MentorSelfAttendance` + field di `MentorDashboardData`
- [x] 5. API `api/mentor/attendance/route.ts` (GET month) + `check-in/route.ts` (POST)
- [x] 6. Hook `use-mentor-attendance.ts` (`useMentorAttendanceMonthQuery` + `useMentorCheckInMutation`)
- [x] 7. Page `(mentor)/mentor/attendance/page.tsx` + view `mentor-self-attendance-view.tsx` (reuse CheckInCard/AttendanceCalendar/AttendanceGuideCard internship)
- [x] 8. Hero `mentor-hero.tsx` pulse→CTA + `mentor-dashboard.tsx` wire mutation; `class-attendance-card.tsx` link → `/mentor/student-attendance`
- [x] 9. Sidebar `mentor-sidebar-config.ts` (Dashboard→Absensi→Daftar Peserta→Absensi Peserta→…)
- [x] 10. PRD §5.4 + §6.9.2.1 Absensi Mentor + update rekap §6.9.2
- [x] 11. Verifikasi: tsc + lint bersih (0 error). Playwright (mentor Syarif): /mentor/attendance render (0 console error, kalender derive 20 Tidak Hadir, tombol disabled "sudah ditutup" karena 17:51 WIB), dashboard hero = tombol Check-In + donut kelas tetap, /mentor/student-attendance utuh (roster 1 peserta hadir 11:14 — baris mentor tak mencemari). POST check-in di luar window → 400 gating benar.
