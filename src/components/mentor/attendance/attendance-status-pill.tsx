import { cn } from "@/lib/utils";
import type { MentorAttendanceRowStatus } from "@/lib/mentor-types";

/** Status → pill styles. Colour language matches the rest of the attendance UI
 *  (Hadir = hijau, Belum = abu-abu, Tidak Hadir = merah). */
const STATUS_PILL: Record<
  MentorAttendanceRowStatus,
  { label: string; cls: string; dot: string }
> = {
  HADIR: {
    label: "Hadir",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  BELUM: {
    label: "Belum absen",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
    dot: "bg-zinc-400",
  },
  TIDAK_HADIR: {
    label: "Tidak hadir",
    cls: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
};

type Props = {
  /** When provided, render the matching status pill. */
  status?: MentorAttendanceRowStatus;
  /** Render a neutral "no attendance expected" pill (libur / out-of-period). */
  neutralLabel?: string;
};

export function AttendanceStatusPill({ status, neutralLabel }: Props) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-400 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:text-zinc-500 dark:ring-white/10">
        <span className="size-2 rounded-full bg-zinc-300 dark:bg-white/20" />
        {neutralLabel ?? "—"}
      </span>
    );
  }

  const pill = STATUS_PILL[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        pill.cls,
      )}
    >
      <span className={cn("size-2 rounded-full", pill.dot)} />
      {pill.label}
    </span>
  );
}
