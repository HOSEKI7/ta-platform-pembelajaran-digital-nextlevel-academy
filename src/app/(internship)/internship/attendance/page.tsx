import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { AttendanceView } from "@/components/internship/attendance/attendance-view";
import { MOCK_ATTENDANCE_WINDOW } from "@/components/internship/dashboard/mock-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Absensi Magang",
  description: "Check-in harian dan rekap kehadiran magang.",
  robots: { index: false, follow: false },
};

export default async function InternshipAttendancePage() {
  await requireRole(Role.PESERTA_MAGANG, { redirectTo: "/internship/dashboard" });

  // Capture "now" on the server so the live clock's first client render matches
  // and the calendar month is deterministic across hydration. Mock data only —
  // real loaders (Attendance table) replace this in a later backend pass.
  const serverNowISO = new Date().toISOString();

  return <AttendanceView serverNowISO={serverNowISO} window={MOCK_ATTENDANCE_WINDOW} />;
}
