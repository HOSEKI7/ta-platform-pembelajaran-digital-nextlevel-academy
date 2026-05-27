"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Inbox, ListTodo } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

import { TaskCard } from "./task-card";
import { resolveStatus, splitByDeadline, type MagangTask } from "./tasks-mock-data";

type Props = {
  tasks: MagangTask[];
  /** Server-captured "now" for deterministic deadline math across hydration. */
  serverNowISO: string;
};

type TabKey = "akan-datang" | "telah-lewat";

/**
 * Client composer for `/internship/tasks`. Splits the mock tasks into upcoming
 * vs. past by deadline (PRD §6.9.3 "Riwayat Tugas") and shows a quick recap
 * strip above the tabbed grid.
 */
export function TasksView({ tasks, serverNowISO }: Props) {
  const now = useMemo(() => new Date(serverNowISO), [serverNowISO]);
  const [tab, setTab] = useState<TabKey>("akan-datang");

  const { upcoming, past } = useMemo(() => splitByDeadline(tasks, now), [tasks, now]);

  const recap = useMemo(() => {
    let terkumpul = 0;
    let menunggu = 0;
    let terlewat = 0;
    for (const t of tasks) {
      const s = resolveStatus(t, now);
      if (s === "TERKUMPUL") terkumpul += 1;
      else if (s === "TERLEWAT") terlewat += 1;
      else menunggu += 1; // BELUM | DIKEMBALIKAN
    }
    return { total: tasks.length, terkumpul, menunggu, terlewat };
  }, [tasks, now]);

  const active = tab === "akan-datang" ? upcoming : past;

  return (
    <StudentPageContainer>
      <PageHeader
        eyebrow="Magang · Tugas"
        title="Daftar"
        accent="Tugas"
        description="Pantau tugas dari mentor, perhatikan tenggat waktunya, dan kumpulkan hasil kerjamu tepat waktu."
      />

      {/* Recap strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RecapStat icon={ListTodo} label="Total Tugas" value={recap.total} tone="brand" />
        <RecapStat icon={CheckCircle2} label="Terkumpul" value={recap.terkumpul} tone="success" />
        <RecapStat icon={ClipboardList} label="Perlu Dikerjakan" value={recap.menunggu} tone="warning" />
        <RecapStat icon={Inbox} label="Tidak Dikumpulkan" value={recap.terlewat} tone="danger" />
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Filter tugas"
          className="inline-flex w-fit gap-1 rounded-2xl bg-zinc-100 p-1 ring-1 ring-zinc-200 dark:bg-white/[0.04] dark:ring-[color:var(--color-surface-border)]"
        >
          <TabButton
            active={tab === "akan-datang"}
            count={upcoming.length}
            onClick={() => setTab("akan-datang")}
          >
            Akan Datang
          </TabButton>
          <TabButton
            active={tab === "telah-lewat"}
            count={past.length}
            onClick={() => setTab("telah-lewat")}
          >
            Telah Lewat
          </TabButton>
        </div>

        {active.length === 0 ? (
          <EmptyTab tab={tab} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((task) => (
              <TaskCard key={task.id} task={task} now={now} />
            ))}
          </div>
        )}
      </div>
    </StudentPageContainer>
  );
}

// ---- Sub-components ----------------------------------------------------------

type RecapTone = "brand" | "success" | "warning" | "danger";

const RECAP_ICON_TONE: Record<RecapTone, string> = {
  brand:
    "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  danger:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
};

function RecapStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ListTodo;
  label: string;
  value: number;
  tone: RecapTone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl ring-1", RECAP_ICON_TONE[tone])}>
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="font-heading text-2xl font-extrabold leading-none tabular-nums text-zinc-900 dark:text-zinc-50">
          {value}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card-strong)] dark:text-zinc-50 dark:ring-[color:var(--color-surface-border)]"
          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
      )}
    >
      {children}
      <span
        className={cn(
          "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
          active
            ? "bg-[color:var(--color-brand-500)] text-white"
            : "bg-zinc-200 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyTab({ tab }: { tab: TabKey }) {
  return (
    <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        {tab === "akan-datang" ? (
          <CheckCircle2 className="size-6" strokeWidth={2} />
        ) : (
          <Inbox className="size-6" strokeWidth={2} />
        )}
      </span>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {tab === "akan-datang" ? "Tidak ada tugas yang akan datang" : "Belum ada riwayat tugas"}
      </p>
      <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
        {tab === "akan-datang"
          ? "Semua tugas dengan tenggat mendatang sudah beres. Mantap!"
          : "Tugas yang sudah melewati tenggat akan muncul di sini."}
      </p>
    </div>
  );
}
