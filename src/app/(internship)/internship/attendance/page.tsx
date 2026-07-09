import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  loadAttendanceMonth,
  loadMagangContext,
} from "@/lib/internship-data-loader";
import {
  clampMonth,
  getWibYmd,
  offFromCell,
  periodMonthBounds,
} from "@/components/internship/attendance/attendance-data";
import type { AttendanceDisplayStatus, CalendarDayStatus } from "@/lib/internship-types";

import { AttendanceView } from "@/components/internship/attendance/attendance-view";
import { InternshipEmptyState } from "@/components/internship/internship-empty-state";

// ponytail: data absensi jarang berubah (check-in max 1x/hari) — 5 menit cache
// cukup. Revalidate by router.refresh() on check-in success.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Absensi Magang",
  description: "Check-in harian dan rekap kehadiran magang.",
  robots: { index: false, follow: false },
};

/** Today's calendar cell status → the tri-state the Check-In card understands. */
function toDisplayStatus(status: CalendarDayStatus | null | undefined): AttendanceDisplayStatus {
  if (status === "HADIR") return "HADIR";
  if (status === "TIDAK_HADIR") return "TIDAK_HADIR";
  return "BELUM";
}

export default async function InternshipAttendancePage() {
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/dashboard",
  });

  const bundle = await loadMagangContext(session.user.id);
  if (!bundle) {
    return (
      <InternshipEmptyState eyebrow="Magang · Absensi" title="Rekam Jejak" accent="Kehadiran" />
    );
  }

  // Capture "now" on the server so the live clock's first client render matches.
  const serverNowISO = new Date().toISOString();
  const today = getWibYmd(serverNowISO);

  // Initially-displayed month = current month clamped into the period.
  const { first, last } = periodMonthBounds(bundle.period);
  const initial = clampMonth({ year: today.year, month: today.month }, first, last);
  // ponytail: pass period dates from bundle (loadMagangContext already fetched
  // the profile) so loadAttendanceMonth skips its own duplicate fetchProfile.
  const [sy, sm, sd] = bundle.period.startISO.split("-").map(Number);
  const [ey, em, ed] = bundle.period.endISO.split("-").map(Number);
  const initialData = await loadAttendanceMonth(
    session.user.id, initial.year, initial.month,
    new Date(Date.UTC(sy, sm - 1, sd)),
    new Date(Date.UTC(ey, em - 1, ed)),
  );
  if (!initialData) {
    return (
      <InternshipEmptyState eyebrow="Magang · Absensi" title="Rekam Jejak" accent="Kehadiran" />
    );
  }

  // Derive today's state from the loaded month (today is in this month whenever
  // it falls inside the period — the only time check-in is relevant).
  const todayCell = initialData.cells.find((c) => c.isToday);
  const todayStatus = toDisplayStatus(todayCell?.status);
  const todayCheckInLabel = todayCell?.status === "HADIR" ? todayCell.checkInTime ?? null : null;
  // Non-null on a non-working day (holiday/weekend/out-of-period) so the card can
  // show a clear "Libur" state; null on a working day (check-in relevant). The
  // window/already-present gating is then applied client-side.
  const todayOff = offFromCell(todayCell);

  return (
    <AttendanceView
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
