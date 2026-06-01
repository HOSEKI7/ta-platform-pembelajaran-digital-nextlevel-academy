"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

/**
 * Tiny client-side sort-state controller shared by the Batch / Bidang / Kelas
 * tables. Each table owns its own comparison logic (a stable module-level
 * function) and just reads `key`/`dir` from here. Clicking the active column
 * toggles direction; a new column resets to ascending.
 */
export function useSortState<K extends string>(
  initialKey: K,
  initialDir: SortDir = "asc",
) {
  const [key, setKey] = useState<K>(initialKey);
  const [dir, setDir] = useState<SortDir>(initialDir);
  const toggle = (next: K) => {
    if (next === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setKey(next);
      setDir("asc");
    }
  };
  return { key, dir, toggle };
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

type SortHeaderProps = {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "center" | "right";
};

export function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: SortHeaderProps) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      className={cn(
        TH,
        align === "center" && "text-center",
        align === "right" && "text-right",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200",
          align === "center" && "justify-center",
          align === "right" && "justify-end",
          active && "text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]",
        )}
      >
        {label}
        <Icon className="size-3" strokeWidth={2.4} />
      </button>
    </th>
  );
}

export const PLAIN_TH = TH;
