"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * Pill-shaped search input with leading icon and trailing clear button.
 * Shared between Kursus Saya and Jelajah Katalog so the two surfaces
 * stay visually identical.
 */
export function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Cari kursus…",
  ariaLabel = "Cari kursus",
  className,
}: Props) {
  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        strokeWidth={2}
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-full bg-white pl-10 pr-9 dark:bg-[color:var(--color-surface-card)]"
        aria-label={ariaLabel}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-50"
          aria-label="Hapus pencarian"
        >
          <X className="size-3.5" strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  );
}
