"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CalendarOff,
  Clock,
  Inbox,
  Loader2,
  Plus,
  type LucideIcon,
} from "lucide-react";

import {
  parseWorkTab,
  type HolidayRow,
  type WorkConfigTab,
} from "@/lib/admin-internship-holiday-query";
import { cn } from "@/lib/utils";
import { useHolidayConfigQuery } from "@/hooks/use-admin-internship-holidays";

import { PageHeader } from "@/components/dashboard/shared/page-header";

import { HolidaysTable } from "./holidays-table";
import { HolidayFormDialog } from "./holiday-form-dialog";
import { HolidayEndEarlyDialog } from "./holiday-end-early-dialog";
import { WindowConfigPlaceholder } from "./window-config-placeholder";

type DialogState =
  | { kind: "create" }
  | { kind: "edit"; row: HolidayRow }
  | { kind: "end-early"; row: HolidayRow }
  | null;

const TABS: { value: WorkConfigTab; label: string; icon: LucideIcon }[] = [
  { value: "holidays", label: "Tanggal Libur", icon: CalendarOff },
  { value: "window", label: "Window Absen", icon: Clock },
];

export function WorkConfigView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseWorkTab(searchParams.get("tab"));
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogNonce, setDialogNonce] = useState(0);

  const query = useHolidayConfigQuery();
  const data = query.data;
  const todayISO = data?.todayISO ?? "";
  const count = data?.holidays.length ?? 0;

  const setTab = (next: WorkConfigTab) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "holidays") sp.delete("tab");
    else sp.set("tab", next);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const open = (next: NonNullable<DialogState>) => {
    setDialogNonce((n) => n + 1);
    setDialog(next);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Program Magang"
        title="Konfigurasi Jam Kerja"
        accent="& Libur"
        description="Kelola tanggal libur magang agar absensi tidak salah mencatat saat ada libur mendadak di luar kalender nasional. Hari libur otomatis dikecualikan dari absensi peserta & mentor."
      />

      <TabSwitcher current={tab} onChange={setTab} />

      {tab === "holidays" ? (
        <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
          <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[color:var(--color-surface-border)]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
                <CalendarOff className="size-5" strokeWidth={2.2} />
              </span>
              <div>
                <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Daftar Tanggal Libur
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {count > 0
                    ? `${count} libur · berlaku global untuk semua kelas`
                    : "Berlaku global untuk semua kelas"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {query.isFetching ? (
                <Loader2 className="size-4 animate-spin text-[color:var(--color-brand-500)]" />
              ) : null}
              <button
                type="button"
                onClick={() => open({ kind: "create" })}
                disabled={query.isPending}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" strokeWidth={2.6} />
                Tambah Libur
              </button>
            </div>
          </div>

          {query.isPending ? (
            <TableSkeleton />
          ) : query.isError ? (
            <ErrorState onRetry={() => query.refetch()} />
          ) : count === 0 ? (
            <EmptyState onAdd={() => open({ kind: "create" })} />
          ) : (
            <HolidaysTable
              rows={data!.holidays}
              todayISO={todayISO}
              isFetching={query.isFetching}
              onEdit={(row) => open({ kind: "edit", row })}
              onEndEarly={(row) => open({ kind: "end-early", row })}
            />
          )}
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
          <WindowConfigPlaceholder />
        </section>
      )}

      {/* Dialogs */}
      {dialog?.kind === "create" || dialog?.kind === "edit" ? (
        <HolidayFormDialog
          key={dialogNonce}
          open
          onOpenChange={(o) => !o && setDialog(null)}
          mode={dialog.kind === "create" ? "create" : "edit"}
          todayISO={todayISO}
          initial={dialog.kind === "edit" ? dialog.row : undefined}
          onSubmitted={() => query.refetch()}
        />
      ) : null}

      {dialog?.kind === "end-early" ? (
        <HolidayEndEarlyDialog
          key={dialogNonce}
          open
          onOpenChange={(o) => !o && setDialog(null)}
          todayISO={todayISO}
          initial={dialog.row}
          onSubmitted={() => query.refetch()}
        />
      ) : null}
    </div>
  );
}

type TabSwitcherProps = {
  current: WorkConfigTab;
  onChange: (next: WorkConfigTab) => void;
};

function TabSwitcher({ current, onChange }: TabSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Tab konfigurasi jam kerja dan libur"
      className={cn(
        "relative inline-grid w-full grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-zinc-200",
        "shadow-[0_24px_40px_-32px_rgba(35,65,137,0.35)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        "sm:max-w-md",
      )}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = current === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              active
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_10px_22px_-12px_rgba(43,114,234,0.7)]"
                : "text-zinc-500 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] dark:text-zinc-300/80 dark:hover:bg-white/[0.04] dark:hover:text-[color:var(--color-brand-200)]",
            )}
          >
            <Icon className="size-4" strokeWidth={2.4} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3.5 w-1/4 rounded bg-zinc-100 dark:bg-white/5" />
          <div className="h-3 flex-1 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-6" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Gagal memuat data libur
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        <CalendarOff className="size-5" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Belum ada tanggal libur. Tambahkan libur pertama.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[12px] font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        Tambah Libur
      </button>
    </div>
  );
}
