import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional element rendered at the top-right (e.g. a status pill). */
  aside?: React.ReactNode;
  children: React.ReactNode;
};

/** Card shell for a course-form section — matches the admin surface chrome. */
export function SectionCard({ icon: Icon, title, description, aside, children }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <Icon className="size-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            {description ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
            ) : null}
          </div>
        </div>
        {aside}
      </header>
      <div className="flex flex-col gap-5 px-5 py-6 sm:px-6">{children}</div>
    </section>
  );
}
