import {
  CalendarRange,
  Clock3,
  Globe2,
  Info,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AttendanceWindow, InternshipPeriod } from "@/lib/internship-types";

import { STATUS_LEGEND } from "./attendance-data";

type Props = {
  window: AttendanceWindow;
  period: InternshipPeriod;
};

/** "yyyy-MM-dd" → "DD/MM/YYYY" (no Date object — the string is already a WIB
 *  calendar date, so reformat the parts directly). */
function formatDateID(dateISO: string): string {
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}/${y}`;
}

export function AttendanceGuideCard({ window, period }: Props) {
  const rules: { icon: LucideIcon; text: string }[] = [
    {
      icon: CalendarRange,
      text: `Periode magang: ${formatDateID(period.startISO)} – ${formatDateID(period.endISO)}. Kalender hanya menampilkan rentang ini.`,
    },
    {
      icon: Clock3,
      text: `Check-in sekali per hari dalam jendela waktu ${window.start}–${window.end} WIB.`,
    },
    {
      icon: TriangleAlert,
      text: "Di luar jendela tombol absen tidak tersedia. Jika jendela lewat dan kamu belum absen, hari itu otomatis tercatat Tidak Hadir.",
    },
    {
      icon: ShieldCheck,
      text: "Hanya admin yang dapat mengoreksi status absensi (mis. izin khusus atau koreksi sistem).",
    },
    {
      icon: Globe2,
      text: "Seluruh waktu mengikuti zona WIB (UTC+7).",
    },
  ];

  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
          <Info className="size-5" strokeWidth={2.2} />
        </span>
        <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
          Panduan Absensi
        </h2>
      </div>

      <ul className="flex flex-col gap-3.5">
        {rules.map((r, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-50 text-[color:var(--color-brand-600)] ring-1 ring-zinc-100 dark:bg-white/[0.04] dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-surface-border)]">
              <r.icon className="size-4" strokeWidth={2.2} />
            </span>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300/85">
              {r.text}
            </p>
          </li>
        ))}
      </ul>

      {/* Color legend */}
      <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
          Keterangan warna
        </p>
        <ul className="grid grid-cols-2 gap-2.5">
          {STATUS_LEGEND.map((l) => (
            <li
              key={l.status}
              className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              <span className={cn("size-3 shrink-0 rounded-[5px]", l.swatch)} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
