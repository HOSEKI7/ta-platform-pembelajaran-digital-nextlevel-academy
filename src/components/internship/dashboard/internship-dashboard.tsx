"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

import { AttendanceHero } from "./attendance-hero";
import { PendingTasksCard } from "./pending-tasks-card";
import { TodayAttendanceCard } from "./today-attendance-card";
import type {
  AttendanceDisplayStatus,
  AttendanceWindow,
  DayMark,
  MagangContext,
  MonthSummary,
  PendingTask,
} from "./mock-data";

const WIB_TZ = "Asia/Jakarta";

type Props = {
  firstName: string;
  serverNowISO: string;
  context: MagangContext;
  window: AttendanceWindow;
  monthSummary: MonthSummary;
  last7: DayMark[];
  tasks: PendingTask[];
};

/**
 * Client composer for the Peserta-Magang dashboard. Owns the demo attendance
 * state so a Check-In in the hero is reflected immediately in the status card.
 * UI-only: Check-In sets local state + a toast, no persistence (real check-in
 * endpoint is a later backend pass).
 */
export function InternshipDashboard({
  firstName,
  serverNowISO,
  context,
  window,
  monthSummary,
  last7,
  tasks,
}: Props) {
  const [status, setStatus] = useState<AttendanceDisplayStatus>("BELUM");
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);

  function handleCheckIn() {
    const nowISO = new Date().toISOString();
    setStatus("HADIR");
    setCheckedInAt(nowISO);
    toast.success("Berhasil check-in", {
      description: `Kamu tercatat hadir pukul ${formatInTimeZone(
        new Date(nowISO),
        WIB_TZ,
        "HH:mm",
      )} WIB.`,
    });
  }

  // Reflect today's live status into the trailing slot of the 7-day strip.
  const last7Live: DayMark[] = last7.map((d, i) =>
    i === last7.length - 1 ? { ...d, status } : d,
  );

  const checkInLabel = checkedInAt
    ? formatInTimeZone(new Date(checkedInAt), WIB_TZ, "HH:mm")
    : null;

  return (
    <StudentPageContainer>
      <AttendanceHero
        firstName={firstName}
        serverNowISO={serverNowISO}
        context={context}
        window={window}
        status={status}
        checkedInAt={checkedInAt}
        onCheckIn={handleCheckIn}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TodayAttendanceCard
            status={status}
            checkInLabel={checkInLabel}
            monthSummary={monthSummary}
            last7={last7Live}
          />
        </div>
        <div className="lg:col-span-2">
          <PendingTasksCard tasks={tasks} serverNowISO={serverNowISO} />
        </div>
      </div>
    </StudentPageContainer>
  );
}
