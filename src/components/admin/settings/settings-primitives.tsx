"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/** Shared card + field primitives for the admin settings forms. */

type SectionProps = {
  eyebrow: string;
  title: string;
  helper: string;
  children: React.ReactNode;
};

export function Section({ eyebrow, title, helper, children }: SectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <header className="mb-5 flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
          {eyebrow}
        </span>
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-300/70">
          {helper}
        </p>
      </header>
      {children}
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function Field({ id, label, icon, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-300"
      >
        {icon}
        {label}
        {required ? (
          <span className="text-[color:var(--color-error)]">*</span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p className="text-[11px] font-semibold text-[color:var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
