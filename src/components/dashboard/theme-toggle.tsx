"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? (resolvedTheme ?? theme) === "dark" : false;

  return (
    <button
      type="button"
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative inline-flex size-10 items-center justify-center rounded-full ring-1 ring-zinc-200 transition",
        "hover:ring-[color:var(--color-brand-300)] hover:bg-[color:var(--color-brand-50)]",
        "dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5 dark:hover:ring-[color:var(--color-surface-border-strong)]",
        className,
      )}
    >
      <Sun
        className={cn(
          "size-4 text-zinc-700 transition-all dark:text-zinc-200",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
        strokeWidth={2.2}
      />
      <Moon
        className={cn(
          "absolute size-4 text-zinc-700 transition-all dark:text-zinc-200",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
        strokeWidth={2.2}
      />
    </button>
  );
}
