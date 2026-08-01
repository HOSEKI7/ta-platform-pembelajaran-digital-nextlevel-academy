"use client";

import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from "react-hook-form";
import { Plus, Trash2, type LucideIcon } from "lucide-react";

import type { PlatformInfo } from "@/lib/validations/admin-platform-settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Section } from "./settings-primitives";

/** Repeatable Visi / Misi / Tim sections for the Informasi Platform form. */

type StatementName = "visi" | "misi";

type StatementSectionProps = {
  control: Control<PlatformInfo>;
  register: UseFormRegister<PlatformInfo>;
  errors: FieldErrors<PlatformInfo>;
  name: StatementName;
  eyebrow: string;
  title: string;
  helper: string;
  /** Singular noun used in the add button + empty state (e.g. "Visi"). */
  noun: string;
  placeholder: string;
  icon: LucideIcon;
  max: number;
};

export function StatementSection({
  control,
  register,
  errors,
  name,
  eyebrow,
  title,
  helper,
  noun,
  placeholder,
  icon: Icon,
  max,
}: StatementSectionProps) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const atMax = fields.length >= max;
  const listErrors = errors[name];

  return (
    <Section eyebrow={eyebrow} title={title} helper={helper}>
      {fields.length === 0 ? (
        <EmptyState
          icon={Icon}
          text={`Belum ada ${noun.toLowerCase()}. Tambahkan minimal satu untuk ditampilkan.`}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const itemError = Array.isArray(listErrors)
              ? listErrors[index]?.value?.message
              : undefined;
            return (
              <li
                key={field.id}
                className="group flex items-start gap-3 rounded-2xl bg-zinc-50/70 p-3 ring-1 ring-zinc-200 transition focus-within:ring-[color:var(--color-brand-300)] dark:bg-white/[0.025] dark:ring-[color:var(--color-surface-border)]"
              >
                <span className="mt-1.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[color:var(--color-brand-500)] text-xs font-bold text-white shadow-[0_8px_18px_-10px_rgba(43,114,234,0.7)]">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Input
                    aria-label={`${noun} ${index + 1}`}
                    placeholder={placeholder}
                    maxLength={name === "visi" ? 255 : 300}
                    className="h-11"
                    {...register(`${name}.${index}.value` as const)}
                  />
                  {itemError ? (
                    <p className="mt-1 text-[11px] font-semibold text-[color:var(--color-error)]">
                      {itemError}
                    </p>
                  ) : null}
                </div>
                <RemoveButton
                  label={`Hapus ${noun.toLowerCase()} ${index + 1}`}
                  onClick={() => remove(index)}
                />
              </li>
            );
          })}
        </ul>
      )}

      <AddButton
        disabled={atMax}
        atMax={atMax}
        label={`Tambah ${noun}`}
        maxLabel={`Maksimal ${max} ${noun.toLowerCase()}`}
        onClick={() => append({ value: "" })}
      />
    </Section>
  );
}

type TeamSectionProps = {
  control: Control<PlatformInfo>;
  register: UseFormRegister<PlatformInfo>;
  errors: FieldErrors<PlatformInfo>;
  eyebrow: string;
  title: string;
  helper: string;
  icon: LucideIcon;
  max: number;
};

export function TeamSection({
  control,
  register,
  errors,
  eyebrow,
  title,
  helper,
  icon: Icon,
  max,
}: TeamSectionProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "tim" });
  const atMax = fields.length >= max;
  const teamErrors = errors.tim;

  return (
    <Section eyebrow={eyebrow} title={title} helper={helper}>
      {fields.length === 0 ? (
        <EmptyState
          icon={Icon}
          text="Belum ada anggota tim. Tambahkan nama dan posisi mereka."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const namaError = Array.isArray(teamErrors)
              ? teamErrors[index]?.nama?.message
              : undefined;
            const posisiError = Array.isArray(teamErrors)
              ? teamErrors[index]?.posisi?.message
              : undefined;
            return (
              <li
                key={field.id}
                className="rounded-2xl bg-zinc-50/70 p-3 ring-1 ring-zinc-200 transition focus-within:ring-[color:var(--color-brand-300)] dark:bg-white/[0.025] dark:ring-[color:var(--color-surface-border)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[color:var(--color-brand-500)] text-xs font-bold text-white shadow-[0_8px_18px_-10px_rgba(43,114,234,0.7)]">
                    {index + 1}
                  </span>
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Input
                        aria-label={`Nama anggota ${index + 1}`}
                        placeholder="Nama lengkap"
                        maxLength={100}
                        className="h-11"
                        {...register(`tim.${index}.nama` as const)}
                      />
                      {namaError ? (
                        <p className="mt-1 text-[11px] font-semibold text-[color:var(--color-error)]">
                          {namaError}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <Input
                        aria-label={`Posisi anggota ${index + 1}`}
                        placeholder="Posisi / jabatan"
                        maxLength={100}
                        className="h-11"
                        {...register(`tim.${index}.posisi` as const)}
                      />
                      {posisiError ? (
                        <p className="mt-1 text-[11px] font-semibold text-[color:var(--color-error)]">
                          {posisiError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <RemoveButton
                    label={`Hapus anggota ${index + 1}`}
                    onClick={() => remove(index)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddButton
        disabled={atMax}
        atMax={atMax}
        label="Tambah Anggota"
        maxLabel={`Maksimal ${max} anggota`}
        onClick={() => append({ nama: "", posisi: "" })}
      />
    </Section>
  );
}

// ---- Shared bits ------------------------------------------------------------

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-8 text-center dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
      <span className="grid size-10 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/10 dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-brand-500)]/25">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <p className="max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {text}
      </p>
    </div>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl text-zinc-400 ring-1 ring-transparent transition",
        "hover:bg-red-50 hover:text-red-600 hover:ring-red-200",
        "dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:hover:ring-red-500/25",
      )}
    >
      <Trash2 className="size-4" strokeWidth={2.2} />
    </button>
  );
}

function AddButton({
  disabled,
  atMax,
  label,
  maxLabel,
  onClick,
}: {
  disabled: boolean;
  atMax: boolean;
  label: string;
  maxLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={onClick}
        className="h-10 rounded-full border-dashed px-4 text-xs font-bold ring-1 ring-zinc-200 dark:ring-[color:var(--color-surface-border)] sm:w-auto"
      >
        <Plus className="size-3.5" strokeWidth={2.6} />
        {label}
      </Button>
      {atMax ? (
        <span className="text-center text-[11px] font-medium text-zinc-400 sm:text-right">
          {maxLabel}
        </span>
      ) : null}
    </div>
  );
}
