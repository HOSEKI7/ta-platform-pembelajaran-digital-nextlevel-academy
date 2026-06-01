"use client";

import {
  CheckCircle2,
  Loader2,
  MinusCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useIntegrationStatusQuery } from "@/hooks/use-integration-status";
import type {
  IntegrationCheck,
  IntegrationState,
} from "@/lib/admin-integration-status";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STATE_META: Record<
  IntegrationState,
  {
    label: string;
    icon: typeof CheckCircle2;
    badge: string;
    iconWrap: string;
  }
> = {
  connected: {
    label: "Terhubung",
    icon: CheckCircle2,
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25",
    iconWrap:
      "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  failed: {
    label: "Gagal",
    icon: XCircle,
    badge:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/25",
    iconWrap:
      "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  },
  not_configured: {
    label: "Belum dikonfigurasi",
    icon: MinusCircle,
    badge:
      "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)]",
    iconWrap:
      "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)]",
  },
};

export function IntegrationStatusPanel() {
  const query = useIntegrationStatusQuery();
  const checks = query.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
              01 · Konektivitas
            </span>
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Status integrasi layanan
            </h2>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-300/70">
              Status diuji langsung ke tiap layanan saat ini. Nilai kunci/secret
              tetap di environment server dan tidak pernah ditampilkan di sini.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
            className="h-10 shrink-0 rounded-full px-4 text-xs font-bold ring-1 ring-zinc-200 dark:ring-[color:var(--color-surface-border)]"
          >
            {query.isFetching ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
            ) : (
              <RefreshCw className="size-3.5" strokeWidth={2.4} />
            )}
            {query.isFetching ? "Memeriksa…" : "Periksa Ulang"}
          </Button>
        </header>

        {/* Security callout */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[color:var(--color-brand-200)] bg-[color:var(--color-brand-50)]/60 px-4 py-3 text-xs text-[color:var(--color-brand-900)] dark:border-[color:var(--color-brand-500)]/25 dark:bg-[color:var(--color-brand-500)]/[0.07] dark:text-[color:var(--color-brand-100)]">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]"
            strokeWidth={2.4}
          />
          <p className="leading-relaxed">
            Kredensial dikelola lewat environment variable (di luar aplikasi).
            Untuk mengubahnya, perbarui konfigurasi deployment — bukan dari
            halaman ini.
          </p>
        </div>

        {query.isError ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            <p className="font-semibold">
              {query.error instanceof Error
                ? query.error.message
                : "Gagal memeriksa status integrasi."}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => query.refetch()}
              className="h-9 rounded-full px-4 text-xs font-bold"
            >
              <RefreshCw className="size-3.5" strokeWidth={2.4} />
              Coba lagi
            </Button>
          </div>
        ) : query.isLoading ? (
          <ul className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200 dark:bg-white/[0.025] dark:ring-[color:var(--color-surface-border)]"
              >
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-3">
            {checks.map((check) => (
              <IntegrationRow key={check.id} check={check} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function IntegrationRow({ check }: { check: IntegrationCheck }) {
  const meta = STATE_META[check.state];
  const Icon = meta.icon;
  return (
    <li className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
          meta.iconWrap,
        )}
      >
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
          {check.label}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-300/70">
          {check.description}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ring-1",
            meta.badge,
          )}
        >
          <Icon className="size-3" strokeWidth={2.6} />
          {meta.label}
        </span>
        {check.detail ? (
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            {check.detail}
          </span>
        ) : null}
      </div>
    </li>
  );
}
