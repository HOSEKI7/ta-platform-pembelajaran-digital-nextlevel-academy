/**
 * Pure helpers + display metadata for the Tugas surface (list + detail). Lives
 * alongside the components since it's UI-facing (status meta classes are
 * tightly coupled to Tailwind tokens), but has no client-only APIs so the
 * server loader can import it safely.
 *
 * Mock data and `getTaskById` are gone — replaced by `internship-task-loader`
 * (`src/lib/internship-task-loader.ts`) which reads from Postgres.
 */

import type { MagangTask, TaskDisplayStatus } from "@/lib/internship-task-types";

// Re-export the most-used types so callers can keep a single import.
export type {
  AttachmentKind,
  MagangTask,
  MentorFeedback,
  SubmittedFile,
  TaskAttachment,
  TaskBaseStatus,
  TaskDisplayStatus,
} from "@/lib/internship-task-types";

// ---- Status metadata --------------------------------------------------------

export type StatusMeta = {
  label: string;
  /** Pill container classes (light + dark). */
  pill: string;
  /** Leading dot color. */
  dot: string;
};

export const STATUS_META: Record<TaskDisplayStatus, StatusMeta> = {
  TERKUMPUL: {
    label: "Terkumpul",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  DIKEMBALIKAN: {
    label: "Dikembalikan",
    pill: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
    dot: "bg-amber-500",
  },
  BELUM: {
    label: "Belum Dikumpulkan",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
    dot: "bg-zinc-400",
  },
  TERLEWAT: {
    label: "Tidak Dikumpulkan",
    pill: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
};

// ---- Urgency ----------------------------------------------------------------

export type UrgencyTone = "danger" | "warning" | "muted";

export type Urgency = { text: string; tone: UrgencyTone; overdue: boolean };

/**
 * Relative deadline label. Mirrors dashboard `pending-tasks-card` thresholds
 * (<24h danger · ≤2d warning · else muted), with an overdue branch for history.
 */
export function urgencyFor(deadlineISO: string, now: Date): Urgency {
  const hours = (new Date(deadlineISO).getTime() - now.getTime()) / 3_600_000;
  if (hours < 0) {
    const days = Math.ceil(-hours / 24);
    return {
      text: days <= 1 ? "Lewat hari ini" : `Lewat ${days} hari lalu`,
      tone: "muted",
      overdue: true,
    };
  }
  if (hours < 24) {
    return { text: `${Math.max(1, Math.round(hours))} jam lagi`, tone: "danger", overdue: false };
  }
  const days = Math.ceil(hours / 24);
  return { text: `${days} hari lagi`, tone: days <= 2 ? "warning" : "muted", overdue: false };
}

/** Effective display status: TERKUMPUL stays; otherwise overdue → TERLEWAT. */
export function resolveStatus(task: MagangTask, now: Date): TaskDisplayStatus {
  if (task.status === "TERKUMPUL") return "TERKUMPUL";
  const overdue = new Date(task.deadlineISO).getTime() < now.getTime();
  if (overdue) return "TERLEWAT";
  return task.status; // BELUM | DIKEMBALIKAN
}

/** Whether the submission window is still open (deadline not yet passed). */
export function isSubmittable(task: MagangTask, now: Date): boolean {
  return new Date(task.deadlineISO).getTime() >= now.getTime();
}

// ---- Collections ------------------------------------------------------------

/** Split into Akan Datang (deadline ≥ now) / Telah Lewat (deadline < now). */
export function splitByDeadline(
  tasks: MagangTask[],
  now: Date,
): { upcoming: MagangTask[]; past: MagangTask[] } {
  const upcoming: MagangTask[] = [];
  const past: MagangTask[] = [];
  for (const t of tasks) {
    if (new Date(t.deadlineISO).getTime() >= now.getTime()) upcoming.push(t);
    else past.push(t);
  }
  upcoming.sort((a, b) => +new Date(a.deadlineISO) - +new Date(b.deadlineISO));
  past.sort((a, b) => +new Date(b.deadlineISO) - +new Date(a.deadlineISO));
  return { upcoming, past };
}

// ---- File size formatting (used by the live dropzone for real Files) --------

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

// ---- File constraints (shared client/server) --------------------------------

export const SUBMISSION_MAX_BYTES = 5 * 1024 * 1024;
export const SUBMISSION_ALLOWED_EXTS = [".pdf", ".docx", ".zip"] as const;
export type SubmissionAllowedExt = (typeof SUBMISSION_ALLOWED_EXTS)[number];

export function getFileExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

export function isAllowedSubmissionExt(name: string): boolean {
  const ext = getFileExt(name);
  return (SUBMISSION_ALLOWED_EXTS as readonly string[]).includes(ext);
}
