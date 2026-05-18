import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  current: number;
  totalPages: number;
  hrefFor: (page: number) => string;
};

/**
 * Build the page-number list with first / last anchors and current ± 1,
 * collapsing gaps to "…".
 */
function buildItems(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis");

  items.push(totalPages);
  return items;
}

export function CoursesPagination({ current, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;

  const items = buildItems(current, totalPages);
  const prevDisabled = current === 1;
  const nextDisabled = current === totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination kursus"
      className="mt-14 flex items-center justify-center gap-2"
    >
      {/* Prev */}
      {prevDisabled ? (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-zinc-300 ring-1 ring-zinc-100"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </span>
      ) : (
        <Link
          href={hrefFor(current - 1)}
          rel="prev"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] hover:ring-[color:var(--color-brand-300)]"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Link>
      )}

      {/* Numbers */}
      <ul className="flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-zinc-200">
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <li
              key={`ell-${idx}`}
              aria-hidden
              className="grid size-9 place-items-center text-sm text-zinc-400"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === current ? "page" : undefined}
                aria-label={`Halaman ${item}`}
                className={cn(
                  "grid size-9 place-items-center rounded-full text-sm font-semibold transition",
                  item === current
                    ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_10px_24px_-10px_rgba(43,114,234,0.7)]"
                    : "text-zinc-700 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)]",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>

      {/* Next */}
      {nextDisabled ? (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-zinc-300 ring-1 ring-zinc-100"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link
          href={hrefFor(current + 1)}
          rel="next"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] hover:ring-[color:var(--color-brand-300)]"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
