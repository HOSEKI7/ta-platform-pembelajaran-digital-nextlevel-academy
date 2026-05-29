import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorAttendanceByDate } from "@/lib/mentor-data-loader";
import { getWibYmd } from "@/components/internship/attendance/attendance-data";

import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";
import { MentorAttendanceView } from "@/components/mentor/student-attendance/mentor-attendance-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Absensi Peserta · Mentor",
  description:
    "Pantau kehadiran peserta magang di kelas bimbingan untuk tanggal yang dipilih.",
  robots: { index: false, follow: false },
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type SearchParams = Promise<{ date?: string }>;

export default async function MentorAttendancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/student-attendance",
  });

  // Default to today (WIB); clamp the upper bound so a future ?date= can't slip
  // through (mentors monitor past/present only). Out-of-period dates are valid —
  // the loader renders them as a "di luar periode" banner.
  const t = getWibYmd(new Date().toISOString());
  const todayISO = `${t.year}-${String(t.month + 1).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;

  const { date } = await searchParams;
  const requested = date && DATE_RE.test(date) ? date : todayISO;
  const dateISO = requested > todayISO ? todayISO : requested;

  const data = await loadMentorAttendanceByDate(session.user.id, dateISO);
  if (!data) {
    return (
      <MentorEmptyState
        eyebrow="Mentor · Absensi"
        title="Absensi"
        accent="Peserta"
      />
    );
  }

  return <MentorAttendanceView initialData={data} initialDateISO={dateISO} />;
}
