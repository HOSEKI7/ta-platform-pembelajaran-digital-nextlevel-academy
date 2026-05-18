"use client";

import { Sparkles, TrendingUp } from "lucide-react";

import { formatExp } from "@/lib/game-formula";
import { useGameProfileQuery } from "@/hooks/use-game-profile";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/ui/shimmer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Level chip — a topbar pill that mirrors the ring/height of the theme and
 * notification controls so it sits in the same visual family, while a small
 * brand-gradient inner medallion keeps the gamification signal distinct.
 * The popover surfaces EXP progress in full.
 */
export function LevelChip() {
  const { data, isPending, isError } = useGameProfileQuery();

  if (isPending) {
    return <Shimmer className="h-10 w-[96px] rounded-full" />;
  }
  if (isError || !data) {
    return null;
  }

  const { level, expToNext } = data;

  // Conic progress ring around the medallion — yellow filled portion mapped
  // to expToNext.pct, brand-tinted remainder. Renders via a mask so only the
  // ring (not the disc) is visible.
  const ringStyle = {
    background: `conic-gradient(var(--color-brand-accent) 0% ${expToNext.pct}%, rgba(255,255,255,0.35) ${expToNext.pct}% 100%)`,
  } as const;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Level ${level}, lihat progres EXP`}
        className={cn(
          "group inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-3.5 ring-1 transition",
          // Light: subtle brand-tinted pill so it pops against neutral siblings
          "bg-gradient-to-r from-[color:var(--color-brand-50)] to-white ring-[color:var(--color-brand-200)]",
          "hover:from-[color:var(--color-brand-100)]/70 hover:to-[color:var(--color-brand-50)] hover:ring-[color:var(--color-brand-400)] hover:-translate-y-px",
          // Dark: deeper brand wash, brand-blue ring
          "dark:bg-[linear-gradient(135deg,rgba(71,142,244,0.18)_0%,rgba(71,142,244,0.04)_100%)] dark:ring-[color:var(--color-brand-500)]/35",
          "dark:hover:ring-[color:var(--color-brand-400)]/60",
        )}
      >
        {/* Conic progress ring wrapping a brand-gradient medallion */}
        <span
          className="relative grid size-8 place-items-center rounded-full"
          style={ringStyle}
        >
          <span
            className="absolute inset-[2px] grid place-items-center rounded-full text-white shadow-[0_6px_16px_-8px_rgba(43,114,234,0.85)]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 75%)",
            }}
          >
            <Sparkles
              className="size-3.5 text-[color:var(--color-brand-accent)]"
              strokeWidth={2.6}
            />
          </span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-200)]">
          Lv
        </span>
        <span className="font-heading text-[15px] font-extrabold leading-none tracking-tight text-[color:var(--color-brand-900)] dark:text-white">
          {level}
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
              "radial-gradient(circle at 88% 8%, rgba(244,214,0,0.55) 0%, transparent 25%)," +
              "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 70%)",
          }}
        >
          <div className="auth-grid-pattern absolute inset-0 opacity-15" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                Level kamu
              </p>
              <p className="mt-1 font-heading text-3xl font-extrabold leading-none">
                {level}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ring-white/25 backdrop-blur">
              <TrendingUp className="size-3" strokeWidth={2.6} /> {expToNext.pct}%
            </span>
          </div>
        </div>

        <div className="space-y-3 px-5 pt-4 pb-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Progres ke Lv {level + 1}
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {formatExp(expToNext.current)} / {formatExp(expToNext.required)} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-brand-700)] transition-all"
              style={{ width: `${expToNext.pct}%` }}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Selesaikan video dan kuis untuk menambah EXP. Bonus +600 XP saat
            menuntaskan kursus.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
