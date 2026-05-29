"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  History,
  Inbox,
  ListTodo,
  Plus,
  Search,
  SearchX,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { MentorTaskRow, MentorTasksData } from "@/lib/mentor-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

import { MentorTaskCard } from "./mentor-task-card";

type Props = {
  data: MentorTasksData;
};

type TabKey = "akan-datang" | "telah-lewat";

/** Split tasks into upcoming (deadline ≥ now) / past (deadline < now). */
function splitByDeadline(
  tasks: MentorTaskRow[],
  now: Date,
): { upcoming: MentorTaskRow[]; past: MentorTaskRow[] } {
  const upcoming: MentorTaskRow[] = [];
  const past: MentorTaskRow[] = [];
  for (const t of tasks) {
    if (new Date(t.deadlineISO).getTime() >= now.getTime()) upcoming.push(t);
    else past.push(t);
  }
  upcoming.sort((a, b) => +new Date(a.deadlineISO) - +new Date(b.deadlineISO));
  past.sort((a, b) => +new Date(b.deadlineISO) - +new Date(a.deadlineISO));
  return { upcoming, past };
}

/**
 * Client composer for `/mentor/tasks` (Kelola Tugas). Mirrors the intern
 * `TasksView` layout — recap strip + Akan Datang/Telah Lewat tabs — but each
 * card shows class-wide submission progress, and the toolbar adds a name search
 * plus a (placeholder) "Buat Tugas Baru" CTA.
 */
export function MentorTasksView({ data }: Props) {
  const { context, tasks, serverNowISO } = data;
  const now = useMemo(() => new Date(serverNowISO), [serverNowISO]);

  const [tab, setTab] = useState<TabKey>("akan-datang");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Recap is computed from the full set, independent of search / tab.
  const recap = useMemo(() => {
    const { upcoming, past } = splitByDeadline(tasks, now);
    const totalSubmissions = tasks.reduce((sum, t) => sum + t.submittedCount, 0);
    return {
      total: tasks.length,
      active: upcoming.length,
      past: past.length,
      totalSubmissions,
    };
  }, [tasks, now]);

  // Search first, then split — tab counts + grid reflect the search.
  const filtered = useMemo(
    () => (q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks),
    [tasks, q],
  );
  const { upcoming, past } = useMemo(
    () => splitByDeadline(filtered, now),
    [filtered, now],
  );
  const active = tab === "akan-datang" ? upcoming : past;

  const onCreate = () =>
    toast.info("Segera hadir", {
      description: "Fitur buat tugas baru sedang disiapkan.",
    });

  return (
    <StudentPageContainer>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Mentor · Tugas"
          title="Kelola"
          accent="Tugas"
          description={`Pantau progres pengumpulan tugas peserta di kelas bimbinganmu — ${context.classFullName}.`}
        />
        <Button
          type="button"
          size="lg"
          onClick={onCreate}
          className="shrink-0 self-start bg-[color:var(--color-brand-600)] px-4 text-white shadow-[0_14px_30px_-14px_rgba(34,91,215,0.7)] hover:bg-[color:var(--color-brand-700)] lg:self-auto"
        >
          <Plus className="size-4" strokeWidth={2.4} />
          Buat Tugas Baru
        </Button>
      </div>

      {/* Recap strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RecapStat icon={ListTodo} label="Total Tugas" value={recap.total} tone="brand" />
        <RecapStat icon={ClipboardList} label="Tugas Aktif" value={recap.active} tone="warning" />
        <RecapStat icon={History} label="Telah Lewat" value={recap.past} tone="muted" />
        <RecapStat icon={Send} label="Total Pengumpulan" value={recap.totalSubmissions} tone="success" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Toolbar: tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              strokeWidth={2}
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama tugas…"
              aria-label="Cari nama tugas"
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        {active.length === 0 ? (
          <EmptyTab tab={tab} searching={q.length > 0} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((task) => (
              <MentorTaskCard key={task.id} task={task} now={now} />
            ))}
          </div>
        )}
      </div>
    </StudentPageContainer>
  );
}

// ---- Sub-components ----------------------------------------------------------

type RecapTone = "brand" | "success" | "warning" | "muted";

const RECAP_ICON_TONE: Record<RecapTone, string> = {
  brand:
    "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  muted:
    "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
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

function EmptyTab({ tab, searching }: { tab: TabKey; searching: boolean }) {
  const icon = searching ? (
    <SearchX className="size-6" strokeWidth={2} />
  ) : tab === "akan-datang" ? (
    <CheckCircle2 className="size-6" strokeWidth={2} />
  ) : (
    <Inbox className="size-6" strokeWidth={2} />
  );

  const title = searching
    ? "Tidak ada tugas yang cocok"
    : tab === "akan-datang"
      ? "Belum ada tugas yang akan datang"
      : "Belum ada riwayat tugas";

  const body = searching
    ? "Coba kata kunci lain atau periksa tab satunya."
    : tab === "akan-datang"
      ? "Buat tugas baru untuk peserta di kelas ini."
      : "Tugas yang sudah melewati tenggat akan muncul di sini.";

  return (
    <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        {icon}
      </span>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</p>
      <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400">{body}</p>
    </div>
  );
}
