"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { SidebarNavItem } from "@/components/dashboard/sidebar-nav-item";

import { INTERNSHIP_NAV_ITEMS } from "./internship-sidebar-config";
import LogoHorizontal from "@/assets/images/nla-horizontal-logo.webp";
import LogoSquare from "@/assets/images/nla-logo.webp";

type Props = {
  collapsed: boolean;
  /** Mobile sheet variant — disables collapse logic, always shows expanded */
  variant?: "rail" | "drawer";
  onNavigate?: () => void;
};

export function InternshipSidebar({
  collapsed,
  variant = "rail",
  onNavigate,
}: Props) {
  const isDrawer = variant === "drawer";
  const isCollapsed = !isDrawer && collapsed;

  return (
    <aside
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "flex h-full flex-col bg-white text-zinc-900 transition-[width] duration-300",
        "dark:bg-[color:var(--color-surface-nav)] dark:text-zinc-100",
        isDrawer
          ? "w-full"
          : "border-r border-zinc-200 dark:border-[color:var(--color-surface-border)]",
        !isDrawer && isCollapsed && "w-[80px]",
        !isDrawer && !isCollapsed && "w-[260px]",
      )}
    >
      {/* Brand row — centered logo with extra vertical breathing room
          (slightly taller than the 64px topbar). */}
      <div className="flex h-20 items-center justify-center px-3 py-3">
        <Link
          href="/internship/dashboard"
          aria-label="NextLevel Academy dashboard"
          onClick={onNavigate}
          className="inline-flex items-center rounded-xl p-1 transition hover:bg-zinc-100/70 dark:hover:bg-white/5"
        >
          {isCollapsed ? (
            <Image
              src={LogoSquare} placeholder="blur"
              alt="NextLevel Academy"
              width={48}
              height={48}
              className="h-9 w-9 object-contain"
              priority
            />
          ) : (
            <Image
              src={LogoHorizontal} placeholder="blur"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              className="h-11 w-auto object-contain"
            />
          )}
        </Link>
      </div>

      {/* Magang badge — clarifies which app surface this is, since the shell
          is visually near-identical to the Peserta-Didik one. */}
      {!isCollapsed ? (
        <div className="px-5 pb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            Magang
          </span>
        </div>
      ) : null}

      {/* Nav */}
      <nav
        aria-label="Menu peserta magang"
        className="flex-1 overflow-hidden px-3 pb-4 pt-2"
      >
        <ul className="space-y-1">
          {INTERNSHIP_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarNavItem
                href={item.href}
                label={item.label}
                icon={item.icon}
                exact={item.exact}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer microcopy */}
      {!isCollapsed ? (
        <div className="border-t border-zinc-200 px-5 py-4 text-[11px] text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
          <p className="font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            NextLevel Academy
          </p>
          <p className="mt-1 leading-relaxed">
            Disiplin absen, tuntaskan tugas tepat waktu.
          </p>
        </div>
      ) : null}
    </aside>
  );
}
