"use client";

import { useState } from "react";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { useAttendanceMonthQuery, useCheckInMutation } from "@/hooks/use-internship-attendance";
import type {
  AttendanceDisplayStatus,
  AttendanceMonthDTO,
  AttendanceWindow,
  InternshipPeriod,
  TodayOff,
} from "@/lib/internship-types";

import { clampMonth, getWibYmd, periodMonthBounds } from "./attendance-data";
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceGuideCard } from "./attendance-guide-card";
import { CheckInCard } from "./check-in-card";

type Props = {
  serverNowISO: string;
  window: AttendanceWindow;
  period: InternshipPeriod;
  /** Initially displayed month (already clamped to the period) + its data. */
  initialYear: number;
  initialMonth: number;
  initialData: AttendanceMonthDTO;
  /** Today's resolved state (server) — drives the Check-In card. */
  todayStatus: AttendanceDisplayStatus;
  todayCheckInLabel: string | null;
  todayOff: TodayOff | null;
};

/**
 * Client composer for `/internship/attendance`. The calendar reads real data via
 * TanStack Query (month navigation refetches, clamped to the period); Check-In
 * is a server-gated mutation that invalidates the grid and refreshes server
 * props on success.
 */
export function AttendanceView({
  serverNowISO,
  window,
  period,
  initialYear,
  initialMonth,
  initialData,
  todayStatus,
  todayCheckInLabel,
  todayOff,
}: Props) {
  const todayYmd = getWibYmd(serverNowISO);
  const { first, last } = periodMonthBounds(period);

  const [displayed, setDisplayed] = useState<{ year: number; month: number }>({
    year: initialYear,
    month: initialMonth,
  });

  const isInitial = displayed.year === initialYear && displayed.month === initialMonth;
  const monthQuery = useAttendanceMonthQuery(
    displayed.year,
    displayed.month,
    isInitial ? initialData : undefined,
  );
  const checkIn = useCheckInMutation();

  const ord = (m: { year: number; month: number }) => m.year * 12 + m.month;
  const canPrev = ord(displayed) > ord(first);
  const canNext = ord(displayed) < ord(last);
  const isCurrentMonth =
    displayed.year === todayYmd.year && displayed.month === todayYmd.month;
  const todayInPeriod =
    ord({ year: todayYmd.year, month: todayYmd.month }) >= ord(first) &&
    ord({ year: todayYmd.year, month: todayYmd.month }) <= ord(last);

  function snapToToday() {
    setDisplayed(clampMonth({ year: todayYmd.year, month: todayYmd.month }, first, last));
  }

  function shiftMonth(delta: number) {
    setDisplayed((prev) => {
      const total = prev.year * 12 + prev.month + delta;
      const next = { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
      return clampMonth(next, first, last);
    });
  }

  function handleCheckIn() {
    // Snap to today's month so the freshly-recorded cell is in view once the
    // invalidated query refetches.
    checkIn.mutate(undefined, { onSuccess: snapToToday });
  }

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
        status={todayStatus}
        checkInLabel={todayCheckInLabel}
        off={todayOff}
        isPending={checkIn.isPending}
        onCheckIn={handleCheckIn}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceCalendar
            year={displayed.year}
            month={displayed.month}
            data={monthQuery.data}
            isFetching={monthQuery.isFetching}
            isCurrentMonth={isCurrentMonth}
            canPrev={canPrev}
            canNext={canNext}
            canJumpToday={todayInPeriod}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={snapToToday}
          />
        </div>
        <div className="lg:col-span-1">
          <AttendanceGuideCard window={window} period={period} />
        </div>
      </div>
    </StudentPageContainer>
  );
}
