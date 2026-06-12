"use client";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { useCheckInMutation } from "@/hooks/use-internship-attendance";
import type {
  AttendanceDisplayStatus,
  AttendanceWindow,
  DayMark,
  MagangContext,
  MonthSummary,
  PendingTask,
  TodayOff,
} from "@/lib/internship-types";

import { AttendanceHero } from "./attendance-hero";
import { PendingTasksCard } from "./pending-tasks-card";
import { TodayAttendanceCard } from "./today-attendance-card";

type Props = {
  firstName: string;
  serverNowISO: string;
  context: MagangContext;
  window: AttendanceWindow;
  todayStatus: AttendanceDisplayStatus;
  todayCheckInLabel: string | null;
  todayOff: TodayOff | null;
  monthSummary: MonthSummary;
  last7: DayMark[];
  tasks: PendingTask[];
};

/**
 * Client composer for the Peserta-Magang dashboard. Renders server-loaded data
 * and wires the hero's Check-In to the server-gated mutation; on success the
 * mutation refreshes server props (router.refresh) so the status reflects DB.
 */
export function InternshipDashboard({
  firstName,
  serverNowISO,
  context,
  window,
  todayStatus,
  todayCheckInLabel,
  todayOff,
  monthSummary,
  last7,
  tasks,
}: Props) {
  const checkIn = useCheckInMutation();

  return (
    <StudentPageContainer>
      <AttendanceHero
        firstName={firstName}
        serverNowISO={serverNowISO}
        context={context}
        window={window}
        status={todayStatus}
        checkInLabel={todayCheckInLabel}
        off={todayOff}
        isPending={checkIn.isPending}
        onCheckIn={() => checkIn.mutate()}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TodayAttendanceCard
            status={todayStatus}
            checkInLabel={todayCheckInLabel}
            off={todayOff}
            monthSummary={monthSummary}
            last7={last7}
          />
        </div>
        <div className="lg:col-span-2">
          <PendingTasksCard tasks={tasks} serverNowISO={serverNowISO} />
        </div>
      </div>
    </StudentPageContainer>
  );
}
