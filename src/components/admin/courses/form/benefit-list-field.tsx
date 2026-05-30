"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourseGeneralInput } from "@/lib/validations/admin-course";

/**
 * Repeater for the "Yang Akan Dipelajari" benefit bullets (PRD §6.11.3 Benefit).
 * Order is positional (array index), persisted as `CourseBenefit.order`.
 */
export function BenefitListField({ disabled }: { disabled?: boolean }) {
  const { control, register } = useFormContext<CourseGeneralInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "benefits" });

  return (
    <div className="flex flex-col gap-2.5">
      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
          Belum ada poin. Tambahkan minimal satu poin yang akan dipelajari peserta.
        </p>
      ) : (
        fields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
              <Sparkles className="size-4" strokeWidth={2.2} />
            </span>
            <Input
              {...register(`benefits.${i}.text` as const)}
              placeholder="mis. Membangun REST API dengan Next.js"
              className="h-10 rounded-xl"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => remove(i)}
              aria-label="Hapus poin"
              className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="size-4" strokeWidth={2.4} />
            </Button>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => append({ text: "" })}
        className="w-fit rounded-full"
      >
        <Plus className="size-3.5" strokeWidth={2.6} />
        Tambah Poin
      </Button>
    </div>
  );
}
