import type { Role } from "@/generated/prisma";
import { ROLE_LABELS } from "@/lib/admin-users-query";
import { cn } from "@/lib/utils";

type Props = {
  role: Role;
  className?: string;
};

const ROLE_META: Record<Role, { dot: string; pill: string }> = {
  PESERTA_DIDIK: {
    dot: "bg-[color:var(--color-brand-500)]",
    pill: "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
  },
  PESERTA_MAGANG: {
    dot: "bg-violet-500",
    pill: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30",
  },
  MENTOR: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  ADMINISTRATOR: {
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
  },
};

/** Role pill for the admin user table. */
export function UserRoleBadge({ role, className }: Props) {
  const meta = ROLE_META[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
        meta.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {ROLE_LABELS[role]}
    </span>
  );
}
