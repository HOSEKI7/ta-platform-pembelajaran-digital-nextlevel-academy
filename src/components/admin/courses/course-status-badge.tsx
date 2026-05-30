import type { CourseStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";

type Props = {
  status: CourseStatus;
  className?: string;
};

const STATUS_META: Record<
  CourseStatus,
  { label: string; dot: string; pill: string }
> = {
  PUBLISHED: {
    label: "Published",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  DRAFT: {
    label: "Draft",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  ARCHIVED: {
    label: "Archived",
    dot: "bg-zinc-400",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
  },
};

/** Tier-colored status pill for the admin course table. */
export function CourseStatusBadge({ status, className }: Props) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
        meta.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
