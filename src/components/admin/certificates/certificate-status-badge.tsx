import { cn } from "@/lib/utils";
import type { CertificateDerivedStatus } from "@/lib/admin-certificates-query";

type Props = {
  status: CertificateDerivedStatus;
  className?: string;
};

const STATUS_META: Record<
  CertificateDerivedStatus,
  { label: string; className: string }
> = {
  valid: {
    label: "Valid",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  expired: {
    label: "Kedaluwarsa",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
};

export function CertificateStatusBadge({ status, className }: Props) {
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
