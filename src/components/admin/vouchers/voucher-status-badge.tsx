import { cn } from "@/lib/utils";
import type { VoucherDerivedStatus } from "@/lib/admin-vouchers-query";

type Props = {
  status: VoucherDerivedStatus;
  className?: string;
};

const STATUS_META: Record<
  VoucherDerivedStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Aktif",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  scheduled: {
    label: "Terjadwal",
    className:
      "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
  },
  inactive: {
    label: "Nonaktif",
    className:
      "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
  },
  expired: {
    label: "Kedaluwarsa",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  exhausted: {
    label: "Habis",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
  },
};

export function VoucherStatusBadge({ status, className }: Props) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
