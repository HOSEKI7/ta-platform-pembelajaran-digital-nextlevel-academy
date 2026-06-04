"use client";

import {
  ClipboardList,
  FileClock,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { useMentorCheckInMutation } from "@/hooks/use-mentor-attendance";
import type { AttendanceWindow } from "@/lib/internship-types";
import type { MentorDashboardData } from "@/lib/mentor-types";

import { ActiveTasksCard } from "./active-tasks-card";
import { ClassAttendanceCard } from "./class-attendance-card";
import { MentorHero } from "./mentor-hero";

type Props = {
  firstName: string;
  /** Polite honorific ("Pak"/"Bu") prepended to the greeting, or null. */
  honorific: string | null;
  serverNowISO: string;
  window: AttendanceWindow;
  data: MentorDashboardData;
};

/**
 * Client composer for the Mentor dashboard. Renders server-loaded, class-scoped
 * data: a command-center hero, three headline stats, and a two-column split of
 * today's class attendance (donut) and the active-task backlog with submission
 * progress.
 */
export function MentorDashboard({
  firstName,
  honorific,
  serverNowISO,
  window,
  data,
}: Props) {
  const checkIn = useMentorCheckInMutation();

  const stats: ReadonlyArray<{
    icon: LucideIcon;
    label: string;
    value: number;
    hint: string;
    accent: string;
  }> = [
    {
      icon: Users,
      label: "Peserta Bimbingan",
      value: data.menteeCount,
      hint: `Kelas ${data.context.section}`,
      accent:
        "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
    },
    {
      icon: ClipboardList,
      label: "Tugas Aktif",
      value: data.activeTasks.length,
      hint: "Belum melewati tenggat",
      accent:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    },
    {
      icon: FileClock,
      label: "Menunggu Review",
      value: data.pendingReviewCount,
      hint: "Submisi siap dinilai",
      accent:
        "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
    },
  ];

  return (
    <StudentPageContainer>
      <MentorHero
        firstName={firstName}
        honorific={honorific}
        serverNowISO={serverNowISO}
        context={data.context}
        window={window}
        status={data.selfAttendance.status}
        checkInLabel={data.selfAttendance.checkInLabel}
        checkable={data.selfAttendance.checkable}
        isPending={checkIn.isPending}
        onCheckIn={() => checkIn.mutate()}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-zinc-200",
              "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
            )}
          >
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-2xl ring-1",
                s.accent,
              )}
            >
              <s.icon className="size-6" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-3xl font-extrabold leading-none tabular-nums text-zinc-900 dark:text-zinc-50">
                {s.value}
              </p>
              <p className="mt-1.5 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {s.label}
              </p>
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {s.hint}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClassAttendanceCard attendance={data.attendance} />
        <ActiveTasksCard tasks={data.activeTasks} serverNowISO={serverNowISO} />
      </div>
    </StudentPageContainer>
  );
}
