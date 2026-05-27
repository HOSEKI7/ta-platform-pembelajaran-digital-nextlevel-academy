"use client";

import { GraduationCap, Layers, MapPin, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MagangContext } from "@/lib/internship-types";

type Props = {
  /** Real placement context (from the layout loader); null when not placed. */
  context: MagangContext | null;
};

/**
 * Class chip — the Peserta-Magang counterpart to the student LevelChip. Peserta
 * Magang are outside the gamification system (PRD §6.7), so instead of EXP/level
 * the topbar surfaces the magang identity (Kelas section at a glance, full
 * Batch/Bidang/Kelas/Mentor context in the popover). Matches the LevelChip
 * ring/height so it sits in the same visual family.
 */
export function InternshipClassChip({ context }: Props) {
  if (!context) {
    return (
      <span
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[11px] font-semibold ring-1",
          "bg-zinc-50 text-zinc-500 ring-zinc-200",
          "dark:bg-white/5 dark:text-zinc-400 dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        <GraduationCap className="size-4" strokeWidth={2.2} />
        Belum ada kelas
      </span>
    );
  }

  const ctx = context;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Kelas ${ctx.classFullName}, lihat detail magang`}
        className={cn(
          "group inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-3.5 ring-1 transition",
          "bg-gradient-to-r from-[color:var(--color-brand-50)] to-white ring-[color:var(--color-brand-200)]",
          "hover:from-[color:var(--color-brand-100)]/70 hover:to-[color:var(--color-brand-50)] hover:ring-[color:var(--color-brand-400)] hover:-translate-y-px",
          "dark:bg-[linear-gradient(135deg,rgba(71,142,244,0.18)_0%,rgba(71,142,244,0.04)_100%)] dark:ring-[color:var(--color-brand-500)]/35",
          "dark:hover:ring-[color:var(--color-brand-400)]/60",
        )}
      >
        <span
          className="grid size-8 place-items-center rounded-full text-white shadow-[0_6px_16px_-8px_rgba(43,114,234,0.85)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 75%)",
          }}
        >
          <GraduationCap className="size-4" strokeWidth={2.4} />
        </span>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-200)] sm:inline">
          Kelas
        </span>
        <span className="font-heading text-[15px] font-extrabold leading-none tracking-tight text-[color:var(--color-brand-900)] dark:text-white">
          {ctx.section}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-72 rounded-2xl border-0 p-0 ring-1 ring-zinc-200 shadow-[0_24px_50px_-20px_rgba(35,65,137,0.35)]",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        <div
          className="relative overflow-hidden rounded-t-2xl px-5 pt-4 pb-5 text-white"
          style={{
            background:
              "radial-gradient(circle at 88% 8%, rgba(244,214,0,0.45) 0%, transparent 26%)," +
              "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 70%)",
          }}
        >
          <div className="auth-grid-pattern absolute inset-0 opacity-15" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              Kelas magang
            </p>
            <p className="mt-1 font-heading text-lg font-extrabold leading-tight">
              {ctx.classFullName}
            </p>
          </div>
        </div>

        <dl className="space-y-3 px-5 pt-4 pb-5">
          <DetailRow icon={Layers} label="Batch" value={ctx.batchLabel} />
          <DetailRow icon={GraduationCap} label="Bidang" value={ctx.fieldLabel} />
          <DetailRow icon={UserRound} label="Mentor" value={ctx.mentorName} />
          {ctx.institution ? (
            <DetailRow icon={MapPin} label="Institusi" value={ctx.institution} />
          ) : null}
        </dl>

        <p className="border-t border-zinc-100 px-5 py-3 text-[11px] leading-relaxed text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
          Bidang dan Kelas ditetapkan oleh admin dan tidak dapat diubah.
        </p>
      </PopoverContent>
    </Popover>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
        <Icon className="size-4" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
          {label}
        </dt>
        <dd className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {value}
        </dd>
      </div>
    </div>
  );
}
