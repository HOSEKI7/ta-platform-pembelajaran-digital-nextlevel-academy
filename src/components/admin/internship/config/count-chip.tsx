import { cn } from "@/lib/utils";

/** Small numeric pill — brand-tinted when non-zero, muted at zero. */
export function CountChip({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-7 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
        value > 0
          ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]"
          : "bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500",
      )}
    >
      {value}
      {suffix ? <span className="font-medium opacity-70">{suffix}</span> : null}
    </span>
  );
}
