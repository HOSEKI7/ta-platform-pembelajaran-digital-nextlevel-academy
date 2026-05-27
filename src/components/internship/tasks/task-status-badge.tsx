import { CheckCircle2, CircleDashed, RotateCcw, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { STATUS_META, type TaskDisplayStatus } from "./tasks-mock-data";

const STATUS_ICON: Record<TaskDisplayStatus, typeof CheckCircle2> = {
  TERKUMPUL: CheckCircle2,
  DIKEMBALIKAN: RotateCcw,
  BELUM: CircleDashed,
  TERLEWAT: XCircle,
};

type Props = {
  status: TaskDisplayStatus;
  /** Slightly larger padding/text for the detail hero. */
  size?: "sm" | "md";
  className?: string;
};

/** Submission-status pill shared by the task list cards and the detail hero. */
export function TaskStatusBadge({ status, size = "sm", className }: Props) {
  const meta = STATUS_META[status];
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full font-bold ring-1",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        meta.pill,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={2.4} />
      {meta.label}
    </span>
  );
}
