import { cn } from "@/lib/utils";

type Props = {
  isActive: boolean;
  className?: string;
};

/** Account status pill (Aktif / Nonaktif). */
export function UserStatusBadge({ isActive, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
          : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-white/10 dark:text-zinc-400 dark:ring-white/15",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-zinc-400",
        )}
      />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}
