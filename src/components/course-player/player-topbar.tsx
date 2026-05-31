"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, ListTree, LogOut, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";

type Props = {
  courseTitle: string;
  courseCategory: string;
  /** Mobile-only trigger to open the curriculum sheet. */
  onOpenCurriculum: () => void;
};

export function PlayerTopbar({
  courseTitle,
  courseCategory,
  onOpenCurriculum,
}: Props) {
  const router = useRouter();

  function handleBack() {
    // Exiting the player always returns the student to their dashboard.
    router.push("/dashboard");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-[color:var(--player-hairline)]",
        "bg-[color:var(--player-stage)]/85 backdrop-blur-xl",
      )}
    >
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Left: back + breadcrumb */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Keluar mode belajar dan kembali"
            className={cn(
              "group inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 pr-3 text-sm font-medium text-foreground/80",
              "ring-1 ring-[color:var(--player-hairline)] bg-[color:var(--player-surface)]/60 transition",
              "hover:bg-[color:var(--player-surface-strong)] hover:text-foreground hover:ring-[color:var(--player-accent)]/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]",
            )}
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2.4}
            />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="hidden h-6 w-px bg-[color:var(--player-hairline)] sm:block" />

          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
              Mode Belajar · {courseCategory}
            </p>
            <h2 className="truncate text-[13px] font-semibold leading-tight text-foreground">
              {courseTitle}
            </h2>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCurriculum}
            aria-label="Buka daftar materi"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-foreground/80 ring-1 ring-[color:var(--player-hairline)] transition",
              "hover:bg-[color:var(--player-surface-strong)] hover:text-foreground hover:ring-[color:var(--player-accent)]/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]",
              "lg:hidden",
            )}
          >
            <ListTree className="size-4" strokeWidth={2.4} />
          </button>

          <ThemeToggle className="ring-[color:var(--player-hairline)] hover:bg-[color:var(--player-surface-strong)] hover:ring-[color:var(--player-accent)]/40 dark:ring-[color:var(--player-hairline)] dark:hover:bg-[color:var(--player-surface-strong)] dark:hover:ring-[color:var(--player-accent)]/40" />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="Opsi lain"
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-full text-foreground/80 ring-1 ring-[color:var(--player-hairline)] transition",
                    "hover:bg-[color:var(--player-surface-strong)] hover:text-foreground hover:ring-[color:var(--player-accent)]/40",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]",
                  )}
                >
                  <MoreHorizontal className="size-4" strokeWidth={2.4} />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                render={
                  <Link href="/my-courses" className="cursor-pointer">
                    <Flag />
                    Lapor masalah materi
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/my-courses" className="cursor-pointer">
                    <LogOut />
                    Keluar mode belajar
                  </Link>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
