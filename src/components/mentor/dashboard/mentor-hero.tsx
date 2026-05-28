"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";
import { Clock, GraduationCap, Layers, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AttendanceWindow } from "@/lib/internship-types";
import type { MentorAttendanceToday, MentorContext } from "@/lib/mentor-types";

const WIB_TZ = "Asia/Jakarta";

function greetingFor(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

type Props = {
  firstName: string;
  /** ISO timestamp captured on the server so the first client render matches. */
  serverNowISO: string;
  context: MentorContext;
  window: AttendanceWindow;
  attendance: MentorAttendanceToday;
};

/**
 * Mentor dashboard hero — a class command-center header. Reuses the visual
 * language of the Peserta-Magang AttendanceHero (gradient + grid pattern + live
 * WIB clock + window timeline) but, since mentors don't check in, the right
 * panel surfaces the class's live attendance pulse instead of a check-in CTA.
 */
export function MentorHero({
  firstName,
  serverNowISO,
  context,
  window,
  attendance,
}: Props) {
  const [now, setNow] = useState<Date>(() => new Date(serverNowISO));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = parseInt(formatInTimeZone(now, WIB_TZ, "H"), 10);
  const dateLabel = formatInTimeZone(now, WIB_TZ, "EEEE, d MMMM yyyy", {
    locale: idLocale,
  });
  const clock = formatInTimeZone(now, WIB_TZ, "HH:mm:ss");

  const nowMin =
    parseInt(formatInTimeZone(now, WIB_TZ, "H"), 10) * 60 +
    parseInt(formatInTimeZone(now, WIB_TZ, "m"), 10);
  const startMin = toMinutes(window.start);
  const endMin = toMinutes(window.end);

  const markerPct = useMemo(() => {
    if (endMin <= startMin) return 0;
    const pct = ((nowMin - startMin) / (endMin - startMin)) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [nowMin, startMin, endMin]);

  const contextChips = [
    { icon: Layers, value: context.batchLabel },
    { icon: GraduationCap, value: context.fieldLabel },
    { icon: Users, value: `${context.studentCount} peserta` },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-[28px] text-white shadow-[0_30px_70px_-40px_rgba(35,65,137,0.7)]"
      style={{
        background:
          "radial-gradient(circle at 90% -10%, rgba(244,214,0,0.45) 0%, transparent 30%)," +
          "radial-gradient(circle at 8% 120%, rgba(71,142,244,0.55) 0%, transparent 38%)," +
          "linear-gradient(135deg, var(--color-brand-800) 0%, var(--color-brand-600) 55%, var(--color-brand-500) 100%)",
      }}
    >
      <div className="auth-grid-pattern absolute inset-0 opacity-[0.12]" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:p-10">
        {/* Left: greeting, class identity, motivational line */}
        <div className="flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
            {dateLabel} · WIB
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {greetingFor(hour)},{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #fff 0%, var(--color-brand-accent-soft) 100%)",
              }}
            >
              {firstName}
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
            Pantau denyut kelas <span className="font-semibold text-white">{context.classFullName}</span> hari ini —
            kehadiran peserta dan tugas yang sedang berjalan.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {contextChips.map((c) => (
              <span
                key={c.value}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <c.icon className="size-3.5" strokeWidth={2.2} />
                {c.value}
              </span>
            ))}
          </div>
        </div>

        {/* Right: live clock, window timeline, class attendance pulse */}
        <div className="flex flex-col gap-5 rounded-3xl bg-white/[0.08] p-5 ring-1 ring-white/15 backdrop-blur-md sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                <Clock className="size-3.5" strokeWidth={2.4} /> Waktu sekarang
              </p>
              <p className="mt-1 font-heading text-4xl font-extrabold leading-none tabular-nums tracking-tight sm:text-5xl">
                {clock}
              </p>
            </div>
            <WindowBadge state={attendance.windowState} />
          </div>

          {/* Window timeline */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-white/70">
              <span>{window.start}</span>
              <span className="uppercase tracking-[0.18em] text-white/50">
                Jendela absen
              </span>
              <span>{window.end}</span>
            </div>
            <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--color-brand-accent)] to-[#fff4a3] transition-all duration-700"
                style={{ width: `${markerPct}%` }}
              />
              <span
                aria-hidden
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.35)] transition-all duration-700"
                style={{ left: `${markerPct}%` }}
              />
            </div>
          </div>

          {/* Attendance pulse */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30">
                <Users className="size-5" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                  Kehadiran hari ini
                </p>
                <p className="text-xs text-white/75">
                  {attendance.isWorkingDay ? "Peserta sudah check-in" : "Hari libur — tidak ada absen"}
                </p>
              </div>
            </div>
            <p className="font-heading text-2xl font-extrabold tabular-nums leading-none">
              {attendance.present}
              <span className="text-base font-bold text-white/55">
                /{attendance.total}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WindowBadge({
  state,
}: {
  state: MentorAttendanceToday["windowState"];
}) {
  const { label, dot } =
    state === "OPEN"
      ? { label: "Sedang dibuka", dot: "bg-[color:var(--color-brand-accent)]" }
      : state === "BEFORE"
        ? { label: "Belum dibuka", dot: "bg-white/60" }
        : state === "AFTER"
          ? { label: "Sudah ditutup", dot: "bg-red-300" }
          : state === "LIBUR"
            ? { label: "Libur", dot: "bg-white/40" }
            : { label: "Di luar periode", dot: "bg-white/40" };

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 ring-1 ring-white/20">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
