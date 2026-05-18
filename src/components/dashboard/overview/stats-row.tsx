"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useDashboardStatsQuery } from "@/hooks/use-dashboard";

import { StatsRowSkeleton } from "../dashboard-skeletons";

type StatKind = "courses" | "inProgress" | "certificates";

type StatDef = {
  kind: StatKind;
  label: string;
  helper: string;
  icon: LucideIcon;
  href: string;
  accent: "blue" | "yellow" | "green";
};

const STATS: StatDef[] = [
  {
    kind: "courses",
    label: "Total Kursus",
    helper: "Kursus yang kamu miliki",
    icon: BookOpen,
    href: "/my-courses",
    accent: "blue",
  },
  {
    kind: "inProgress",
    label: "Sedang Berjalan",
    helper: "Kursus aktif kamu pelajari",
    icon: PlayCircle,
    href: "/my-courses",
    accent: "yellow",
  },
  {
    kind: "certificates",
    label: "Sertifikat",
    helper: "Sertifikat yang sudah diraih",
    icon: Award,
    href: "/certificates",
    accent: "green",
  },
];

const idFmt = new Intl.NumberFormat("id-ID");

export function StatsRow() {
  const { data, isPending, isError } = useDashboardStatsQuery();

  if (isPending) return <StatsRowSkeleton />;
  if (isError || !data) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Gagal memuat statistik. Coba muat ulang.
      </p>
    );
  }

  const valueByKind: Record<StatKind, number> = {
    courses: data.totalCourses,
    inProgress: data.inProgress,
    certificates: data.certificates,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {STATS.map((s) => (
        <StatCard key={s.kind} {...s} value={valueByKind[s.kind]} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  helper,
  icon: Icon,
  href,
  value,
  accent,
}: StatDef & { value: number }) {
  const accentClass =
    accent === "blue"
      ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30"
      : accent === "yellow"
        ? "bg-[color:var(--color-brand-accent)]/15 text-[color:var(--color-brand-900)] ring-[color:var(--color-brand-accent)]/30 dark:bg-[color:var(--color-brand-accent)]/10 dark:text-[color:var(--color-brand-accent)] dark:ring-[color:var(--color-brand-accent)]/25"
        : "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-zinc-200 transition",
        "hover:-translate-y-0.5 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_24px_50px_-30px_rgba(35,65,137,0.35)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/60 dark:hover:shadow-[0_24px_50px_-26px_rgba(71,142,244,0.45)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1",
            accentClass,
          )}
        >
          <Icon className="size-3" strokeWidth={2.4} />
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-heading text-4xl font-extrabold leading-none text-zinc-900 dark:text-zinc-50">
          {idFmt.format(value)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-300/70">{helper}</p>
    </Link>
  );
}
