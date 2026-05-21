import { cn } from "@/lib/utils";

type Props = {
  /** Small uppercase label sitting above the title (e.g. "Akademi · Kursus Saya"). */
  eyebrow: string;
  /** Plain text title prefix shown before the gradient accent word(s). */
  title: string;
  /** The word(s) rendered with the brand gradient. Punctuation handled internally. */
  accent: string;
  /** Optional supporting paragraph below the title. */
  description?: string;
  /** Optional terminator after the accent (defaults to "."). Pass empty string to omit. */
  punctuation?: string;
  className?: string;
};

/**
 * Canonical page header for every Peserta Didik surface. Mirrors the
 * dashboard/settings reference: eyebrow → gradient h1 → description, no
 * right-side CTAs (those belong inside the content toolbar).
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  punctuation = ".",
  className,
}: Props) {
  return (
    <header className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
        {eyebrow}
      </p>
      <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        {title}{" "}
        <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
          {accent}
        </span>
        {punctuation}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300/80">
          {description}
        </p>
      ) : null}
    </header>
  );
}
