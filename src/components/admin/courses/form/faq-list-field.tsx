"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharCounter } from "@/components/ui/char-counter";
import type { CourseGeneralInput } from "@/lib/validations/admin-course";

/**
 * Repeater for catalog FAQ entries (PRD §6.11.3 FAQ). Each item is a
 * question + answer pair; order is positional (`CourseFaq.order`).
 */
export function FaqListField({ disabled }: { disabled?: boolean }) {
  const { control, register, watch } = useFormContext<CourseGeneralInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });
  const faqsValues = watch("faqs") || [];

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
          Belum ada FAQ. Opsional, tapi membantu calon peserta.
        </p>
      ) : (
        fields.map((field, i) => (
          <div
            key={field.id}
            className="flex flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3.5 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                {i + 1}
              </span>
              <div className="relative flex-1">
                <Input
                  {...register(`faqs.${i}.question` as const)}
                  placeholder="Pertanyaan…"
                  maxLength={150}
                  className="h-10 rounded-xl font-medium pr-16"
                  disabled={disabled}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CharCounter current={(faqsValues[i]?.question || "").length} max={150} showWarningLabel={false} />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => remove(i)}
                aria-label="Hapus FAQ"
                className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="size-4" strokeWidth={2.2} />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <Textarea
                {...register(`faqs.${i}.answer` as const)}
                placeholder="Jawaban…"
                rows={2}
                maxLength={150}
                className="rounded-xl"
                disabled={disabled}
              />
              <div className="flex justify-end">
                <CharCounter current={(faqsValues[i]?.answer || "").length} max={150} />
              </div>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => append({ question: "", answer: "" })}
        className="w-fit rounded-full"
      >
        <Plus className="size-3.5" strokeWidth={2.6} />
        Tambah FAQ
      </Button>
    </div>
  );
}
