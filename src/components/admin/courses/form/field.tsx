import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CharCounter } from "@/components/ui/char-counter";

type Props = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  /** Optional "Opsional" tag rendered next to the label. */
  optional?: boolean;
  /** Character counter parameters. */
  current?: number;
  max?: number;
  className?: string;
  children: React.ReactNode;
};

/** Consistent label + hint + error wrapper for the course form fields. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  current,
  max,
  className,
  children,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {label}
          </Label>
          {optional ? (
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:bg-white/10 dark:text-zinc-500">
              Opsional
            </span>
          ) : null}
        </div>
        {max !== undefined && current !== undefined ? (
          <CharCounter current={current} max={max} />
        ) : null}
      </div>
      {hint ? <p className="-mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      {children}
      {error ? <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
