import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  error?: string;
  /** Optional helper text shown under the label. */
  hint?: string;
  children: React.ReactNode;
};

/** Labelled form row with inline error/hint — shared by the config dialogs. */
export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </Label>
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
