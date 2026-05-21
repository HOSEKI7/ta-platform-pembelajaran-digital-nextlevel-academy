"use client";

import { useState } from "react";
import { Check, Copy, Lock, Sparkles, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RewardMilestone } from "./mock-data";

type MilestoneState = "locked" | "claimable" | "claimed";

type Props = {
  currentLevel: number;
  milestones: RewardMilestone[];
  claimed: Record<number, true>;
  onClaim: (level: number) => void;
};

function getState(
  milestone: RewardMilestone,
  currentLevel: number,
  claimed: Record<number, true>,
): MilestoneState {
  if (claimed[milestone.targetLevel]) return "claimed";
  if (currentLevel >= milestone.targetLevel) return "claimable";
  return "locked";
}

export function RewardRoadmap({ currentLevel, milestones, claimed, onClaim }: Props) {
  const maxLevel = milestones[milestones.length - 1].targetLevel;
  const linePct = Math.min(100, Math.round((currentLevel / maxLevel) * 100));

  return (
    <section className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
            Reward Roadmap · Voucher Diskon
          </p>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Target Level & Hadiah
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300/80">
            Kunci terbuka saat kamu mencapai Level 5, 10, dan 15. Tekan
            &quot;Klaim&quot; untuk membuka kode voucher.
          </p>
        </div>
      </header>

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        {/* Decorative dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            color: "rgb(15 23 42)",
          }}
          aria-hidden
        />

        {/* Connecting timeline — desktop only */}
        <div className="relative hidden lg:block">
          <div className="absolute left-[16.66%] right-[16.66%] top-12 h-1.5 rounded-full bg-zinc-200 dark:bg-white/10" />
          <div
            className="exp-line-progress absolute left-[16.66%] top-12 h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `calc(${Math.max(0, linePct - 16.66)}% - 0px)`,
              maxWidth: "calc(66.66%)",
            }}
          />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-3 lg:gap-6">
          {milestones.map((m) => {
            const state = getState(m, currentLevel, claimed);
            return (
              <MilestoneCard
                key={m.targetLevel}
                milestone={m}
                state={state}
                onClaim={() => onClaim(m.targetLevel)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type MilestoneCardProps = {
  milestone: RewardMilestone;
  state: MilestoneState;
  onClaim: () => void;
};

function MilestoneCard({ milestone, state, onClaim }: MilestoneCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(milestone.voucherCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — clipboard not available
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      {/* Medallion */}
      <div className="relative">
        {state === "claimable" && (
          <span
            className="exp-badge-aura pointer-events-none absolute -inset-3 -z-10 rounded-full opacity-70 blur-xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(71,142,244,0.65), transparent)",
            }}
            aria-hidden
          />
        )}
        {state === "claimed" && (
          <span
            className="exp-badge-aura pointer-events-none absolute -inset-3 -z-10 rounded-full opacity-70 blur-xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(244,214,0,0.7), transparent)",
            }}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "relative z-10 grid size-24 place-items-center rounded-full ring-4 ring-white shadow-lg transition",
            "dark:ring-[color:var(--color-surface-card)]",
            state === "locked" &&
              "bg-zinc-100 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-500",
            state === "claimable" &&
              "bg-gradient-to-br from-[color:var(--color-brand-500)] to-[color:var(--color-brand-800)] text-white",
            state === "claimed" &&
              "bg-gradient-to-br from-[color:var(--color-brand-accent)] to-amber-500 text-[color:var(--color-brand-950)]",
          )}
        >
          {state === "locked" ? (
            <Lock className="size-9" strokeWidth={2.2} />
          ) : (
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                Diskon
              </span>
              <span className="font-heading text-3xl font-extrabold">
                {milestone.discountPct}%
              </span>
            </div>
          )}
        </div>
        {state === "claimed" && (
          <span className="absolute -right-1 -top-1 z-20 grid size-7 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-[color:var(--color-surface-card)]">
            <Check className="size-4" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
          Target Level
        </p>
        <h3 className="font-heading text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Level {milestone.targetLevel}
        </h3>
        <p className="max-w-[18rem] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300/80">
          Voucher diskon{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {milestone.discountPct}%
          </span>{" "}
          untuk pembelian kursus berikutnya.
        </p>
      </div>

      {state === "locked" && (
        <div className="mt-1 w-full max-w-[220px] space-y-2">
          <Button
            disabled
            variant="outline"
            size="lg"
            className="h-11 w-full rounded-full text-sm"
          >
            <Lock className="size-4" />
            Capai Lv {milestone.targetLevel} dulu
          </Button>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Hadiah akan terbuka otomatis
          </p>
        </div>
      )}

      {state === "claimable" && (
        <div className="mt-1 w-full max-w-[220px] space-y-2">
          <Button
            onClick={onClaim}
            size="lg"
            className={cn(
              "h-11 w-full rounded-full text-sm",
              "bg-gradient-to-br from-[color:var(--color-brand-500)] to-[color:var(--color-brand-700)] text-white",
              "shadow-[0_18px_36px_-18px_rgba(35,65,137,0.65)]",
              "hover:from-[color:var(--color-brand-600)] hover:to-[color:var(--color-brand-800)]",
            )}
          >
            <Sparkles className="size-4" />
            Klaim Voucher
          </Button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
            Siap diklaim
          </p>
        </div>
      )}

      {state === "claimed" && (
        <div className="mt-1 w-full max-w-[260px] space-y-2">
          <div className="flex items-stretch gap-2">
            <code className="flex flex-1 items-center truncate rounded-lg bg-zinc-50 px-3 py-2.5 text-left font-mono text-xs font-bold tracking-wider text-zinc-900 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10">
              {milestone.voucherCode}
            </code>
            <button
              onClick={handleCopy}
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-3 text-white transition",
                copied
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-[color:var(--color-brand-500)] hover:bg-[color:var(--color-brand-600)]",
              )}
              aria-label="Salin kode voucher"
            >
              {copied ? (
                <Check className="size-4" strokeWidth={2.8} />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Ticket className="size-3" strokeWidth={2.6} />
            Berlaku hingga{" "}
            {milestone.expiresAt.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
