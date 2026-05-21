"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * Circle-button pagination shared across student tables and grids.
 * Renders `1 … current-neighbors … total` with chevron prev/next.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  ariaLabel = "Paginasi",
  className,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <button
        type="button"
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page <= 1}
        className={navButtonClass}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="size-4" strokeWidth={2.4} />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="px-1 text-xs text-zinc-400 dark:text-zinc-500"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full text-xs font-bold transition",
              p === page
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_22px_-10px_rgba(43,114,234,0.7)]"
                : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] dark:bg-[color:var(--color-surface-card)] dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-surface-card-strong)]",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => page < totalPages && onChange(page + 1)}
        disabled={page >= totalPages}
        className={navButtonClass}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="size-4" strokeWidth={2.4} />
      </button>
    </nav>
  );
}

const navButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full bg-white text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-600 dark:bg-[color:var(--color-surface-card)] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-surface-card-strong)] dark:disabled:hover:bg-[color:var(--color-surface-card)]";

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}
