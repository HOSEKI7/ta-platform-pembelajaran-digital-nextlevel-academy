import type { TransactionStatus } from "@/lib/transaction-data-loader";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for transaction-status styling (PRD §6.4.4):
 * PENDING = kuning, SUCCESS = hijau, FAILED = merah, EXPIRED = abu,
 * CANCELED = rose (batal-sendiri, beda warna dari "Gagal").
 * Shared by the list table and the detail page so colours never drift.
 */
export const STATUS_META: Record<
  TransactionStatus,
  {
    label: string;
    /** Solid dot colour. */
    dot: string;
    /** Pill background + text + ring (light & dark). */
    pill: string;
    /** Gradient strip used as a hero accent on the detail page. */
    accent: string;
  }
> = {
  PENDING: {
    label: "Menunggu",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    accent: "from-amber-400 to-amber-500",
  },
  SUCCESS: {
    label: "Berhasil",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    accent: "from-emerald-400 to-emerald-500",
  },
  FAILED: {
    label: "Gagal",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
    accent: "from-red-400 to-red-500",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    dot: "bg-zinc-400",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10",
    accent: "from-zinc-300 to-zinc-400",
  },
  CANCELED: {
    label: "Dibatalkan",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
    accent: "from-rose-400 to-rose-500",
  },
};

type Props = {
  status: TransactionStatus;
  size?: "sm" | "lg";
  className?: string;
};

export function StatusBadge({ status, size = "sm", className }: Props) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold ring-1 ring-inset",
        size === "lg"
          ? "px-3.5 py-1.5 text-xs"
          : "px-2.5 py-1 text-[11px]",
        meta.pill,
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full",
          size === "lg" ? "size-2" : "size-1.5",
          meta.dot,
        )}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}
