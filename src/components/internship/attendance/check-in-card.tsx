"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";
import { CalendarCheck, CheckCircle2, Clock, Fingerprint, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AttendanceDisplayStatus, AttendanceWindow } from "@/lib/internship-types";

import { WIB_TZ, computeWindow } from "./attendance-data";

type Props = {
  /** ISO captured on the server so the first client render matches SSR. */
  serverNowISO: string;
  window: AttendanceWindow;
  status: AttendanceDisplayStatus;
  checkInLabel: string | null;
  /** Server fact: today is an eligible working day (in period, not holiday). */
  checkable: boolean;
  isPending: boolean;
  onCheckIn: () => void;
};

const STATUS_PILL: Record<AttendanceDisplayStatus, { label: string; cls: string; dot: string }> = {
  HADIR: {
    label: "Hadir",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  BELUM: {
    label: "Belum absen",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
    dot: "bg-zinc-400",
  },
  TIDAK_HADIR: {
    label: "Tidak hadir",
    cls: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
};

export function CheckInCard({
  serverNowISO,
  window,
  status,
  checkInLabel,
  checkable,
  isPending,
  onCheckIn,
}: Props) {
  const [now, setNow] = useState<Date>(() => new Date(serverNowISO));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateLabel = formatInTimeZone(now, WIB_TZ, "EEEE, d MMMM yyyy", {
    locale: idLocale,
  });
  const clock = formatInTimeZone(now, WIB_TZ, "HH:mm:ss");
  const { state, markerPct } = computeWindow(now, window);

  const checkedIn = status === "HADIR";
  const checkInTime = checkInLabel;
  const pill = STATUS_PILL[status];
  // Enabled only when the server marks today eligible AND the window is open.
  const canCheckIn = checkable && state === "OPEN" && !checkedIn;

  const windowHint = checkedIn
    ? "Kehadiranmu hari ini sudah tercatat."
    : !checkable
      ? "Hari ini bukan hari absen (libur/akhir pekan/di luar periode)."
      : state === "OPEN"
        ? "Jendela absen sedang dibuka — silakan check-in."
        : state === "BEFORE"
          ? `Jendela absen dibuka pukul ${window.start} WIB.`
          : "Jendela absen hari ini sudah ditutup.";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      {/* Soft brand wash, top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(71,142,244,0.10) 0%, transparent 38%)",
        }}
      />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        {/* Identity */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <CalendarCheck className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-heading text-xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-100">
                Absen Hari Ini
              </h2>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {dateLabel} · WIB
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1",
              pill.cls,
            )}
          >
            <span className={cn("size-1.5 rounded-full", pill.dot)} />
            {pill.label}
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {windowHint}
          </p>
        </div>

        {/* Action panel */}
        <div className="w-full shrink-0 rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-100 lg:w-[380px] dark:bg-white/[0.03] dark:ring-[color:var(--color-surface-border)]">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              <Clock className="size-3.5" strokeWidth={2.4} /> Waktu sekarang
            </p>
            <p className="font-heading text-2xl font-extrabold leading-none tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
              {clock}
            </p>
          </div>

          {/* Window timeline */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span>{window.start}</span>
              <span className="uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Jendela absen
              </span>
              <span>{window.end}</span>
            </div>
            <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--color-brand-400)] to-[color:var(--color-brand-600)] transition-all duration-700"
                style={{ width: `${markerPct}%` }}
              />
              <span
                aria-hidden
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(43,114,234,0.2)] ring-1 ring-[color:var(--color-brand-500)] transition-all duration-700"
                style={{ left: `${markerPct}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5">
            {checkedIn ? (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30">
                <CheckCircle2 className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    Sudah absen hari ini
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70">
                    Check-in pukul {checkInTime} WIB
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onCheckIn}
                disabled={!canCheckIn || isPending}
                className={cn(
                  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition",
                  "bg-[color:var(--color-brand-accent)] text-[color:var(--color-brand-950)]",
                  "shadow-[0_14px_30px_-12px_rgba(244,214,0,0.8)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(244,214,0,0.9)] active:translate-y-0",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0",
                )}
              >
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.3} />
                ) : (
                  <Fingerprint className="size-5 transition group-hover:scale-110" strokeWidth={2.3} />
                )}
                {isPending ? "Memproses…" : "Check-In Sekarang"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
