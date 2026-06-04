"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { GenderValue } from "@/lib/validations/admin-user";

const OPTIONS: ReadonlyArray<{ value: GenderValue; label: string }> = [
  { value: "MALE", label: "Laki-laki" },
  { value: "FEMALE", label: "Perempuan" },
];

type Props = {
  /** Selected gender, or null/undefined when not set (optional field). */
  value: GenderValue | null | undefined;
  onChange: (value: GenderValue) => void;
  disabled?: boolean;
};

/**
 * Optional gender picker for mentor accounts. Renders two radios (Laki-laki /
 * Perempuan); leaving it unselected keeps the field empty. Drives the polite
 * "Pak/Bu" greeting on the mentor dashboard.
 */
export function GenderRadio({ value, onChange, disabled }: Props) {
  return (
    <RadioGroup
      value={value ?? null}
      onValueChange={(v) => {
        if (typeof v === "string") onChange(v as GenderValue);
      }}
      disabled={disabled}
      className="grid-cols-2 gap-3"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition",
              "border-zinc-200 bg-white hover:border-[color:var(--color-brand-300)] dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]",
              active &&
                "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)] dark:bg-[color:var(--color-brand-500)]/10",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <RadioGroupItem value={opt.value} />
            <span className="text-zinc-800 dark:text-zinc-100">{opt.label}</span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
