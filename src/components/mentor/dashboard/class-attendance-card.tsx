"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MentorAttendanceToday } from "@/lib/mentor-types";

type Props = {
  attendance: MentorAttendanceToday;
};

// SVG donut geometry.
const RADIUS = 54;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Segment = { key: string; value: number; color: string };

const WINDOW_BADGE: Record<
  MentorAttendanceToday["windowState"],
  { label: string; cls: string }
> = {
  OPEN: {
    label: "Jendela absen dibuka",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  BEFORE: {
    label: "Jendela absen belum dibuka",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
  },
  AFTER: {
    label: "Jendela absen sudah ditutup",
    cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  LIBUR: {
    label: "Hari libur",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
  },
  LUAR_PERIODE: {
    label: "Di luar periode magang",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
  },
};

export function ClassAttendanceCard({ attendance }: Props) {
  const { present, belum, tidakHadir, total, isWorkingDay, windowState } =
    attendance;

  const ratePct =
    isWorkingDay && total > 0 ? Math.round((present / total) * 100) : 0;
  const badge = WINDOW_BADGE[windowState];

  // Donut segments — only meaningful on a working day with students.
  const segments: Segment[] = isWorkingDay
    ? [
        { key: "present", value: present, color: "var(--color-success)" },
        { key: "belum", value: belum, color: "#a1a1aa" /* zinc-400 */ },
        { key: "tidakHadir", value: tidakHadir, color: "#ef4444" /* red-500 */ },
      ].filter((s) => s.value > 0)
    : [];

  // Accumulate dash offsets so segments chain around the ring.
  let acc = 0;
  const arcs = segments.map((s) => {
    const len = total > 0 ? (s.value / total) * CIRCUMFERENCE : 0;
    const arc = {
      ...s,
      dasharray: `${len} ${CIRCUMFERENCE - len}`,
      dashoffset: -acc,
    };
    acc += len;
    return arc;
  });

  const rows: ReadonlyArray<{ label: string; value: number; dot: string }> = [
    { label: "Hadir", value: present, dot: "bg-emerald-500" },
    { label: "Belum absen", value: belum, dot: "bg-zinc-400" },
    { label: "Tidak hadir", value: tidakHadir, dot: "bg-red-500" },
  ];

  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <CalendarCheck className="size-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
              Kehadiran Hari Ini
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Rekap absensi kelas
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
        {/* Donut */}
        <div className="relative grid shrink-0 place-items-center">
          <svg
            width={148}
            height={148}
            viewBox="0 0 148 148"
            className="-rotate-90"
            role="img"
            aria-label={`${present} dari ${total} peserta hadir`}
          >
            {/* Track */}
            <circle
              cx={74}
              cy={74}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-zinc-100 dark:stroke-white/10"
            />
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={74}
                cy={74}
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                strokeDasharray={a.dasharray}
                strokeDashoffset={a.dashoffset}
                style={{ transition: "stroke-dasharray 700ms ease" }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            {isWorkingDay ? (
              <div>
                <p className="font-heading text-3xl font-extrabold leading-none text-zinc-900 dark:text-zinc-50">
                  {ratePct}
                  <span className="text-lg">%</span>
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  hadir
                </p>
              </div>
            ) : (
              <p className="max-w-[5rem] text-center text-xs font-semibold leading-tight text-zinc-400 dark:text-zinc-500">
                {windowState === "LUAR_PERIODE" ? "Di luar periode" : "Hari libur"}
              </p>
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex w-full flex-col gap-2.5">
          <div className="rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
              Sudah absen
            </p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {present}
              </span>
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                dari {total} peserta
              </span>
            </p>
          </div>

          <ul className="flex flex-col gap-1.5">
            {rows.map((r) => (
              <li
                key={r.label}
                className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 dark:border-[color:var(--color-surface-border)]"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <span className={cn("size-2 rounded-full", r.dot)} />
                  {r.label}
                </span>
                <span className="font-heading text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ring-1",
          badge.cls,
        )}
      >
        {badge.label}
      </span>

      <Link
        href="/mentor/attendance"
        className="group mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-brand-700)] transition hover:gap-1.5 dark:text-[color:var(--color-brand-300)]"
      >
        Lihat manajemen absensi
        <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
      </Link>
    </section>
  );
}
