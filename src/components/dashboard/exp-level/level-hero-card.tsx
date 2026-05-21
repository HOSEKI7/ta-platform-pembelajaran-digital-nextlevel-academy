import { Sparkles, TrendingUp, Zap } from "lucide-react";

import { formatExp, type ExpProgress } from "@/lib/game-formula";
import { cn } from "@/lib/utils";

type Props = {
  level: number;
  exp: number;
  totalExp: number;
  expToNext: ExpProgress;
  badgeTitle: string;
};

export function LevelHeroCard({ level, totalExp, expToNext, badgeTitle }: Props) {
  const remaining = Math.max(0, expToNext.required - expToNext.current);

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] text-white",
        "ring-1 ring-white/15",
        "shadow-[0_40px_80px_-40px_rgba(35,65,137,0.55)]",
      )}
      style={{
        background:
          "radial-gradient(120% 80% at 100% 0%, rgba(244,214,0,0.65) 0%, transparent 38%)," +
          "radial-gradient(80% 100% at 0% 100%, rgba(71,142,244,0.55) 0%, transparent 50%)," +
          "linear-gradient(135deg, var(--color-brand-950) 0%, var(--color-brand-800) 28%, var(--color-brand-600) 70%, var(--color-brand-500) 100%)",
      }}
    >
      {/* Layered textures */}
      <div className="auth-grid-pattern pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden />
      <div className="exp-noise pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" aria-hidden />

      {/* Glow halo behind the level numeral */}
      <span
        className="exp-badge-aura pointer-events-none absolute -left-12 top-1/2 -z-0 size-[28rem] -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(244,214,0,0.35) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Floating decorative particles */}
      <span
        className="exp-particle pointer-events-none absolute left-[14%] top-[12%] size-2 rounded-full bg-white/80"
        style={{ animationDelay: "0s" }}
        aria-hidden
      />
      <span
        className="exp-particle pointer-events-none absolute right-[18%] top-[18%] size-1.5 rounded-full bg-[color:var(--color-brand-accent)]"
        style={{ animationDelay: "1.2s" }}
        aria-hidden
      />
      <span
        className="exp-particle pointer-events-none absolute bottom-[16%] left-[44%] size-1 rounded-full bg-white/70"
        style={{ animationDelay: "2.4s" }}
        aria-hidden
      />
      <span
        className="exp-particle pointer-events-none absolute right-[36%] top-[58%] size-2 rounded-full bg-[color:var(--color-brand-accent)]/70"
        style={{ animationDelay: "1.8s" }}
        aria-hidden
      />
      <span
        className="exp-particle pointer-events-none absolute bottom-[30%] right-[10%] size-1.5 rounded-full bg-white/60"
        style={{ animationDelay: "3.2s" }}
        aria-hidden
      />

      <div className="relative grid gap-10 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:items-end lg:gap-14">
        {/* LEFT: huge level numeral + title chip */}
        <div className="flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] ring-1 ring-white/25 backdrop-blur">
            <Sparkles className="size-3 text-[color:var(--color-brand-accent)]" strokeWidth={2.6} />
            Title aktif · {badgeTitle}
          </div>

          <div className="flex items-end gap-5">
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/60">
                Level
              </p>
              <p className="font-heading text-[6.5rem] font-extrabold leading-[0.85] tracking-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:text-[8rem] lg:text-[9rem]">
                {level}
              </p>
            </div>

            <div className="hidden flex-col gap-1 pb-3 sm:flex">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Berikutnya
              </p>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/20 backdrop-blur">
                <Zap className="size-4 text-[color:var(--color-brand-accent)]" strokeWidth={2.6} />
                <span className="font-heading text-xl font-extrabold leading-none">
                  Lv {level + 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: progress + stats */}
        <div className="flex flex-col gap-6">
          {/* Progress section */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Progres ke Lv {level + 1}
              </span>
              <span className="font-mono text-xs font-bold tabular-nums sm:text-sm">
                {formatExp(expToNext.current)} / {formatExp(expToNext.required)} XP
              </span>
            </div>

            <div className="relative h-4 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <div
                className="relative h-full overflow-hidden rounded-full"
                style={{
                  width: `${expToNext.pct}%`,
                  background:
                    "linear-gradient(90deg, #fde047 0%, var(--color-brand-accent) 50%, #fbbf24 100%)",
                  boxShadow: "0 0 24px rgba(244,214,0,0.55)",
                }}
              >
                <span className="exp-progress-shimmer" aria-hidden />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-semibold">{expToNext.pct}% selesai</span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <TrendingUp className="size-3.5" strokeWidth={2.6} />
                {formatExp(remaining)} XP lagi
              </span>
            </div>
          </div>

          {/* Stat blocks */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatPill
              label="Total EXP"
              value={formatExp(totalExp)}
              hint="Sepanjang masa"
              variant="bright"
            />
            <StatPill
              label="EXP Sesi Ini"
              value={formatExp(expToNext.current)}
              hint="Reset saat level-up"
              variant="muted"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  label,
  value,
  hint,
  variant,
}: {
  label: string;
  value: string;
  hint: string;
  variant: "bright" | "muted";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl px-4 py-3 ring-1 backdrop-blur transition",
        variant === "bright"
          ? "bg-[color:var(--color-brand-accent)]/15 ring-[color:var(--color-brand-accent)]/35"
          : "bg-white/10 ring-white/15",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-heading text-2xl font-extrabold leading-none sm:text-3xl",
          variant === "bright" && "text-[color:var(--color-brand-accent)]",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] text-white/55">{hint}</p>
    </div>
  );
}
