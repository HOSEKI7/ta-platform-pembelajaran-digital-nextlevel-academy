"use client";

import {
  Award,
  Crown,
  Flame,
  GraduationCap,
  Lock,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { BadgeIconKey, BadgeItemDTO } from "@/lib/gamification-types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<BadgeIconKey, LucideIcon> = {
  sparkles: Sparkles,
  trophy: Trophy,
  flame: Flame,
  crown: Crown,
  award: Award,
  star: Star,
  rocket: Rocket,
  "graduation-cap": GraduationCap,
};

type Props = {
  badges: BadgeItemDTO[];
};

export function BadgeCollection({ badges }: Props) {
  // Earned first (sorted by earnedAt desc), then locked (by threshold asc).
  const sorted = [...badges].sort((a, b) => {
    if (a.earnedAt && b.earnedAt) {
      return b.earnedAt.getTime() - a.earnedAt.getTime();
    }
    if (a.earnedAt) return -1;
    if (b.earnedAt) return 1;
    return a.threshold - b.threshold;
  });

  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const progressPct = badges.length
    ? Math.round((earnedCount / badges.length) * 100)
    : 0;

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
            Koleksi Badge
          </p>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Lemari Pencapaian
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300/80">
            Badge yang sudah kamu kumpulkan tampil berwarna penuh. Yang lain
            masih menunggu untuk diraih.
          </p>
        </div>

        {/* Mini progress chip */}
        <div className="inline-flex items-center gap-3 self-start rounded-2xl bg-white px-4 py-2.5 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Terbuka
            </span>
            <span className="font-heading text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {earnedCount}{" "}
              <span className="text-zinc-400 dark:text-zinc-500">
                / {badges.length}
              </span>
            </span>
          </div>
          <div className="relative h-12 w-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-[color:var(--color-brand-500)] to-[color:var(--color-brand-accent)] transition-all"
              style={{ height: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {sorted.map((b) => (
          <BadgeCard key={b.id} badge={b} />
        ))}
      </div>
    </section>
  );
}

function BadgeCard({ badge }: { badge: BadgeItemDTO }) {
  const Icon = ICON_MAP[badge.iconKey];
  const earned = Boolean(badge.earnedAt);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl p-6 transition",
        earned
          ? cn(
              "bg-white ring-1 ring-zinc-200",
              "hover:-translate-y-1 hover:shadow-[0_28px_50px_-30px_rgba(35,65,137,0.5)]",
              "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] dark:hover:shadow-[0_28px_50px_-25px_rgba(71,142,244,0.45)]",
            )
          : cn(
              "bg-zinc-50/60 ring-1 ring-dashed ring-zinc-300/60",
              "dark:bg-[color:var(--color-surface-card)]/40 dark:ring-[color:var(--color-surface-border)]",
            ),
      )}
    >
      {/* Background sheen for earned badges */}
      {earned ? (
        <div
          className="exp-badge-aura pointer-events-none absolute -right-12 -top-12 size-40 rounded-full opacity-50 blur-2xl"
          style={{
            background: `radial-gradient(closest-side, ${badge.glowColor}, transparent)`,
          }}
          aria-hidden
        />
      ) : null}

      <div className="relative flex flex-col items-center gap-4 text-center">
        {/* Medallion */}
        <div className="relative">
          {earned ? (
            <>
              <span
                className={cn(
                  "pointer-events-none absolute -inset-2 -z-10 rounded-full opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-90",
                  "bg-gradient-to-br",
                  badge.gradientFrom,
                  badge.gradientTo,
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "relative grid size-20 place-items-center rounded-full text-white shadow-[0_18px_28px_-12px_rgba(15,23,42,0.45)]",
                  "bg-gradient-to-br",
                  badge.gradientFrom,
                  badge.gradientTo,
                  "ring-[6px] ring-white dark:ring-[color:var(--color-surface-card)]",
                  "transition-transform duration-500 group-hover:scale-105",
                )}
              >
                {badge.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={badge.logoUrl}
                    alt={badge.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <Icon className="size-9" strokeWidth={2.2} />
                )}
              </div>
            </>
          ) : (
            <div className="relative grid size-20 place-items-center rounded-full bg-zinc-200/80 text-zinc-400 ring-[6px] ring-white dark:bg-zinc-800/50 dark:text-zinc-500 dark:ring-[color:var(--color-surface-card)]">
              {badge.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={badge.logoUrl}
                  alt={badge.name}
                  className="size-full rounded-full object-cover opacity-40 grayscale"
                />
              ) : (
                <Icon className="size-9 opacity-40 grayscale" strokeWidth={2.2} />
              )}
              <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-white text-zinc-500 ring-2 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700">
                <Lock className="size-3.5" strokeWidth={2.6} />
              </span>
            </div>
          )}
        </div>

        {/* Name + description */}
        <div className="space-y-1.5">
          <h3
            className={cn(
              "font-heading text-base font-extrabold tracking-tight",
              earned
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {badge.name}
          </h3>
          <p
            className={cn(
              "max-w-[16rem] text-xs leading-relaxed",
              earned
                ? "text-zinc-600 dark:text-zinc-300/80"
                : "text-zinc-400 dark:text-zinc-500",
            )}
          >
            {badge.description}
          </p>
        </div>

        {/* Footer chip */}
        {earned && badge.earnedAt ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <Sparkles className="size-3" strokeWidth={2.6} />
            Diraih{" "}
            {badge.earnedAt.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10">
            <Lock className="size-3" strokeWidth={2.6} />
            Terkunci
          </span>
        )}
      </div>
    </article>
  );
}
