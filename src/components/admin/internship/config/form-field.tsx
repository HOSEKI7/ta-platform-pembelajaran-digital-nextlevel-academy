import { Label } from "@/components/ui/label";
import { CharCounter } from "@/components/ui/char-counter";

type FieldProps = {
  label: string;
  error?: string;
  /** Optional helper text shown under the label. */
  hint?: string;
  current?: number;
  max?: number;
  children: React.ReactNode;
};

/** Labelled form row with inline error/hint — shared by the config dialogs. */
export function Field({ label, error, hint, current, max, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {label}
        </Label>
        {max !== undefined && current !== undefined ? (
          <CharCounter current={current} max={max} />
        ) : null}
      </div>
      {hint ? (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
