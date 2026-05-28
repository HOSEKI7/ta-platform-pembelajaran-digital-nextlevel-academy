"use client";

import { Bell, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Notifications bell for the Mentor surface.
 *
 * A mentor notifications backend (e.g. "<Peserta> mengumpulkan tugas", PRD
 * §6.10.1) does not exist yet. Until it does, this is a self-contained, static
 * empty-state bell — no network call, no QueryClient dependency — matching the
 * Peserta-Magang surface.
 */
export function MentorNotificationsButton() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifikasi"
        className={cn(
          "relative inline-flex size-10 items-center justify-center rounded-full ring-1 ring-zinc-200 transition",
          "hover:ring-[color:var(--color-brand-300)] hover:bg-[color:var(--color-brand-50)]",
          "dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5 dark:hover:ring-[color:var(--color-surface-border-strong)]",
        )}
      >
        <Bell className="size-4 text-zinc-700 dark:text-zinc-200" strokeWidth={2.2} />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[340px] rounded-2xl border-0 p-0 ring-1 ring-zinc-200 shadow-[0_24px_50px_-20px_rgba(35,65,137,0.35)] dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-[color:var(--color-surface-border)]">
          <div>
            <p className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Notifikasi
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Semua sudah dibaca
            </p>
          </div>
        </div>

        <div className="grid place-items-center gap-2 px-4 py-10 text-center">
          <Inbox className="size-7 text-zinc-300 dark:text-zinc-600" />
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Belum ada notifikasi.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
