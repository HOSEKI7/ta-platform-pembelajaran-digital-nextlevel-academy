import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  loadMentorAttendanceMonth,
  loadMentorContext,
} from "@/lib/mentor-data-loader";
import {
  clampMonth,
  getWibYmd,
  offFromCell,
  periodMonthBounds,
} from "@/components/internship/attendance/attendance-data";
import type {
  AttendanceDisplayStatus,
  CalendarDayStatus,
} from "@/lib/internship-types";

import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";
import { MentorSelfAttendanceView } from "@/components/mentor/attendance/mentor-self-attendance-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Absensi · Mentor",
  description: "Check-in harian dan rekap kehadiran mentor.",
  robots: { index: false, follow: false },
};

/** Today's calendar cell status → the tri-state the Check-In card understands. */
function toDisplayStatus(status: CalendarDayStatus | null | undefined): AttendanceDisplayStatus {
  if (status === "HADIR") return "HADIR";
  if (status === "TIDAK_HADIR") return "TIDAK_HADIR";
  return "BELUM";
}

export default async function MentorAttendancePage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/attendance",
  });

  const bundle = await loadMentorContext(session.user.id);
  if (!bundle) {
    return (
      <MentorEmptyState eyebrow="Mentor · Absensi" title="Rekam Jejak" accent="Kehadiran" />
    );
  }

  // Capture "now" on the server so the live clock's first client render matches.
  const serverNowISO = new Date().toISOString();
  const today = getWibYmd(serverNowISO);

  // Initially-displayed month = current month clamped into the period.
  const { first, last } = periodMonthBounds(bundle.period);
  const initial = clampMonth({ year: today.year, month: today.month }, first, last);
  const initialData = await loadMentorAttendanceMonth(
    session.user.id,
    initial.year,
    initial.month,
  );
  if (!initialData) {
    return (
      <MentorEmptyState eyebrow="Mentor · Absensi" title="Rekam Jejak" accent="Kehadiran" />
    );
  }

  // Derive today's state from the loaded month (today is in this month whenever
  // it falls inside the period — the only time check-in is relevant).
  const todayCell = initialData.cells.find((c) => c.isToday);
  const todayStatus = toDisplayStatus(todayCell?.status);
  const todayCheckInLabel = todayCell?.status === "HADIR" ? todayCell.checkInTime ?? null : null;
  // Non-null on a non-working day (holiday/weekend/out-of-period) so the card can
  // show a clear "Libur" state; null on a working day. Window/already-present
  // gating is applied client-side.
  const todayOff = offFromCell(todayCell);

  return (
    <MentorSelfAttendanceView
      serverNowISO={serverNowISO}
      window={INTERNSHIP_CHECKIN_WINDOW}
      period={bundle.period}
      initialYear={initial.year}
      initialMonth={initial.month}
      initialData={initialData}
      todayStatus={todayStatus}
      todayCheckInLabel={todayCheckInLabel}
      todayOff={todayOff}
    />
  );
}
