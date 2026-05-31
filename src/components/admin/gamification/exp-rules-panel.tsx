import { Gift, Sparkles, TrendingUp } from "lucide-react";

import {
  EXP_ACTION_RULES,
  EXP_LEVEL_FORMULA,
  LEVEL_TITLE_RULES,
  REWARD_VOUCHER_RULES,
  REWARD_VOUCHER_VALID_DAYS,
  sampleLevelRequirements,
} from "@/lib/gamification-rules";
import { formatExp } from "@/lib/game-formula";

/**
 * Read-only "Aturan EXP" tab (PRD §6.11.8). Pure presentation — EXP amounts are
 * configured at the backend level and shown here for reference only.
 */
export function ExpRulesPanel() {
  const samples = sampleLevelRequirements(5);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        icon={<Sparkles className="size-5" strokeWidth={2.2} />}
        title="Perolehan EXP"
        subtitle="Aksi peserta didik yang memberikan EXP (dikonfigurasi di backend, hanya bisa dilihat)."
      >
        <ul className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
          {EXP_ACTION_RULES.map((rule) => (
            <li
              key={rule.source}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {rule.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {rule.note}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-sm font-bold tabular-nums text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
                +{formatExp(rule.exp)} EXP
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        icon={<TrendingUp className="size-5" strokeWidth={2.2} />}
        title="Progresi Level"
        subtitle="EXP terkumpul dalam level berjalan dan di-reset ke 0 saat naik level."
      >
        <div className="mb-4 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.04]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Formula EXP yang dibutuhkan untuk naik dari Level L
          </p>
          <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {EXP_LEVEL_FORMULA}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Contoh kebutuhan EXP
            </p>
            <ul className="space-y-1.5">
              {samples.map((s) => (
                <li
                  key={s.level}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-600 dark:text-zinc-300">
                    Level {s.level} → {s.level + 1}
                  </span>
                  <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatExp(s.req)} EXP
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Gelar berdasarkan level
            </p>
            <ul className="space-y-1.5">
              {LEVEL_TITLE_RULES.map((t) => (
                <li
                  key={t.title}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.title}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Gift className="size-5" strokeWidth={2.2} />}
        title="Reward Voucher"
        subtitle={`Voucher diskon yang bisa diklaim di level tertentu, berlaku ${REWARD_VOUCHER_VALID_DAYS} hari sejak klaim.`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {REWARD_VOUCHER_RULES.map((r) => (
            <div
              key={r.level}
              className="rounded-2xl bg-zinc-50 p-4 text-center dark:bg-white/[0.04]"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Level {r.level}
              </p>
              <p className="font-heading text-2xl font-bold text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-200)]">
                {r.discountPct}%
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Diskon pembelian
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function SectionCard({ icon, title, subtitle, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
          {icon}
        </span>
        <div>
          <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
