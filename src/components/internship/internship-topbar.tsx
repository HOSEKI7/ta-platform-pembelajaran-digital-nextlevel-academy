"use client";

import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProfileMenu } from "@/components/dashboard/profile-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

import { InternshipClassChip } from "./internship-class-chip";
import { InternshipNotificationsButton } from "./internship-notifications-button";

type Props = {
  user: {
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
  };
  onOpenMobileNav: () => void;
};

export function InternshipTopbar({ user, onOpenMobileNav }: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-md transition-colors sm:px-6",
        "dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-nav)]/92",
      )}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Buka menu navigasi"
        onClick={onOpenMobileNav}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full ring-1 ring-zinc-200 transition md:hidden",
          "hover:bg-[color:var(--color-brand-50)] hover:ring-[color:var(--color-brand-300)]",
          "dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5 dark:hover:ring-[color:var(--color-surface-border-strong)]",
        )}
      >
        <Menu className="size-4 text-zinc-700 dark:text-zinc-200" strokeWidth={2.2} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster — three semantic groups, two hairline separators.
          Group 1: identity context (Kelas magang) — replaces the student
          gamification LevelChip, which doesn't apply to PESERTA_MAGANG.
          Group 2: workspace controls (Theme + Notifications).
          Group 3: identity (Profile). */}
      <div className="flex items-center gap-3 sm:gap-4">
        <InternshipClassChip />

        <Separator />

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <InternshipNotificationsButton />
        </div>

        <Separator />

        <ProfileMenu user={user} />
      </div>
    </header>
  );
}

function Separator() {
  return (
    <span
      aria-hidden
      className={cn(
        "hidden h-7 w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent sm:block",
        "dark:via-[color:var(--color-surface-border-strong)]",
      )}
    />
  );
}
