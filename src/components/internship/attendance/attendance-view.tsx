"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import type {
  AttendanceDisplayStatus,
  AttendanceWindow,
} from "@/components/internship/dashboard/mock-data";

import { WIB_TZ, getWibYmd } from "./attendance-data";
import { AttendanceCalendar } from "./attendance-calendar";
import { AttendanceGuideCard } from "./attendance-guide-card";
import { CheckInCard } from "./check-in-card";

type Props = {
  serverNowISO: string;
  window: AttendanceWindow;
};

/**
 * Client composer for `/internship/attendance`. Owns the demo check-in state so
 * a Check-In in the top card immediately recolors today's calendar cell, plus
 * the displayed-month state for calendar navigation. UI-only: Check-In sets
 * local state + a toast, no persistence (real endpoint is a later backend pass).
 */
export function AttendanceView({ serverNowISO, window }: Props) {
  const todayYmd = getWibYmd(serverNowISO);

  const [status, setStatus] = useState<AttendanceDisplayStatus>("BELUM");
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [displayed, setDisplayed] = useState<{ year: number; month: number }>({
    year: todayYmd.year,
    month: todayYmd.month,
  });

  function handleCheckIn() {
    const nowISO = new Date().toISOString();
    setStatus("HADIR");
    setCheckedInAt(nowISO);
    // Snap back to the current month so the freshly-green cell is visible.
    setDisplayed({ year: todayYmd.year, month: todayYmd.month });
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
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
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
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={() => setDisplayed({ year: todayYmd.year, month: todayYmd.month })}
          />
        </div>
        <div className="lg:col-span-1">
          <AttendanceGuideCard window={window} />
        </div>
      </div>
    </StudentPageContainer>
  );
}
