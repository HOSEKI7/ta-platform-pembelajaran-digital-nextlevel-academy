"use client";

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import type {
  AttendanceDisplayStatus,
  AttendanceWindow,
  Holiday,
  InternshipPeriod,
} from "@/components/internship/dashboard/mock-data";

import {
  WIB_TZ,
  clampMonth,
  expandHolidays,
  getWibYmd,
  periodMonthBounds,
} from "./attendance-data";
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceGuideCard } from "./attendance-guide-card";
import { CheckInCard } from "./check-in-card";

type Props = {
  serverNowISO: string;
  window: AttendanceWindow;
  period: InternshipPeriod;
  holidays: Holiday[];
};

/**
 * Client composer for `/internship/attendance`. Owns the demo check-in state so
 * a Check-In in the top card immediately recolors today's calendar cell, plus
 * the displayed-month state for calendar navigation. UI-only: Check-In sets
 * local state + a toast, no persistence (real endpoint is a later backend pass).
 */
export function AttendanceView({ serverNowISO, window, period, holidays }: Props) {
  const todayYmd = getWibYmd(serverNowISO);

  // Calendar navigation is bounded by the internship period (Batch start/end).
  const { first, last } = periodMonthBounds(period);
  const holidayMap = useMemo(() => expandHolidays(holidays), [holidays]);

  const [status, setStatus] = useState<AttendanceDisplayStatus>("BELUM");
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [displayed, setDisplayed] = useState<{ year: number; month: number }>(() =>
    clampMonth({ year: todayYmd.year, month: todayYmd.month }, first, last),
  );

  const ord = (m: { year: number; month: number }) => m.year * 12 + m.month;
  const canPrev = ord(displayed) > ord(first);
  const canNext = ord(displayed) < ord(last);
  const todayInPeriod =
    ord({ year: todayYmd.year, month: todayYmd.month }) >= ord(first) &&
    ord({ year: todayYmd.year, month: todayYmd.month }) <= ord(last);

  function handleCheckIn() {
    const nowISO = new Date().toISOString();
    setStatus("HADIR");
    setCheckedInAt(nowISO);
    // Snap back to the current month so the freshly-green cell is visible.
    setDisplayed(clampMonth({ year: todayYmd.year, month: todayYmd.month }, first, last));
    toast.success("Berhasil check-in", {
      description: `Kamu tercatat hadir pukul ${formatInTimeZone(
        new Date(nowISO),
        WIB_TZ,
        "HH:mm",
      )} WIB.`,
    });
  }

  function shiftMonth(delta: number) {
    setDisplayed((prev) => {
      const total = prev.year * 12 + prev.month + delta;
      const next = { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
      return clampMonth(next, first, last);
    });
  }

  const todayCheckInTime = checkedInAt
    ? formatInTimeZone(new Date(checkedInAt), WIB_TZ, "HH:mm")
    : null;

  return (
    <StudentPageContainer>
      <PageHeader
        eyebrow="Magang · Absensi"
        title="Rekam Jejak"
        accent="Kehadiran"
        description="Check-in setiap hari kerja dalam jendela waktu yang ditentukan, dan pantau riwayat kehadiranmu sepanjang program magang."
      />

      <CheckInCard
        serverNowISO={serverNowISO}
        window={window}
        status={status}
        checkedInAt={checkedInAt}
        onCheckIn={handleCheckIn}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceCalendar
            year={displayed.year}
            month={displayed.month}
            todayISO={serverNowISO}
            todayStatus={status}
            todayCheckInTime={todayCheckInTime}
            periodStartISO={period.startISO}
            periodEndISO={period.endISO}
            holidayMap={holidayMap}
            canPrev={canPrev}
            canNext={canNext}
            canJumpToday={todayInPeriod}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={() =>
              setDisplayed(
                clampMonth({ year: todayYmd.year, month: todayYmd.month }, first, last),
              )
            }
          />
        </div>
        <div className="lg:col-span-1">
          <AttendanceGuideCard window={window} period={period} />
        </div>
      </div>
    </StudentPageContainer>
  );
}
