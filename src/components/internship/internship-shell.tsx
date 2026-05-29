"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { MagangContext } from "@/lib/internship-types";

import { InternshipSidebar } from "./internship-sidebar";
import { InternshipTopbar } from "./internship-topbar";

const COLLAPSED_STORAGE_KEY = "internship-sidebar-collapsed";

type Props = {
  user: {
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
  };
  context: MagangContext | null;
  initialCollapsed: boolean;
  children: React.ReactNode;
};

export function InternshipShell({ user, context, initialCollapsed, children }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Persist collapsed state to localStorage. Cookie is the SSR source of truth;
  // localStorage mirrors it for client-side persistence across tabs.
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
      // Also reflect to cookie so the server picks it up on next request.
      document.cookie = `${COLLAPSED_STORAGE_KEY}=${
        collapsed ? "1" : "0"
      }; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    } catch {
      // Storage may be unavailable (private mode); fall through silently.
    }
  }, [collapsed]);

  return (
    <div className="relative flex min-h-screen bg-[color:var(--color-surface-app)] text-zinc-900 dark:text-zinc-100">
      {/* Desktop rail — pinned to the viewport so it stays put while the main
          column scrolls (sticky + self-start prevents flex-stretch). */}
      <div className="sticky top-0 hidden h-screen self-start md:block">
        <InternshipSidebar collapsed={collapsed} />
      </div>

      {/* Floating collapse toggle — anchored to the seam corner where the
          topbar's bottom edge meets the sidebar's right border. Desktop-only. */}
      <button
        type="button"
        aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
        onClick={() => setCollapsed((v) => !v)}
        style={{ left: collapsed ? 80 : 260 }}
        className={cn(
          "fixed top-16 z-40 hidden -translate-x-1/2 -translate-y-1/2 md:grid",
          "size-7 place-items-center rounded-full bg-white ring-1 ring-zinc-200 text-[color:var(--color-brand-600)]",
          "shadow-[0_4px_12px_-4px_rgba(35,65,137,0.25)] transition-[left,transform,box-shadow] duration-300",
          "hover:scale-[1.08] hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_8px_20px_-6px_rgba(71,142,244,0.45)]",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border-strong)] dark:text-[color:var(--color-brand-300)]",
          "dark:hover:ring-[color:var(--color-brand-400)]/60 dark:hover:shadow-[0_8px_20px_-6px_rgba(71,142,244,0.35)]",
        )}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" strokeWidth={2.6} />
        ) : (
          <ChevronLeft className="size-3.5" strokeWidth={2.6} />
        )}
      </button>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[280px] gap-0 border-0 bg-[color:var(--color-surface-nav)] p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Menu peserta magang</SheetTitle>
          <InternshipSidebar
            variant="drawer"
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <InternshipTopbar
          user={user}
          context={context}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="relative flex-1">
          {/* Workspace atmosphere: subtle radial gradient for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(circle at 92% 0%, rgba(71,142,244,0.08) 0%, transparent 36%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
            style={{
              background:
                "radial-gradient(circle at 14% 12%, rgba(71,142,244,0.08) 0%, transparent 32%)",
            }}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
