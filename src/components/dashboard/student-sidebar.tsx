"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { SidebarNavItem } from "./sidebar-nav-item";
import { STUDENT_NAV_ITEMS } from "./student-sidebar-config";
import LogoHorizontal from "@/assets/images/nla-horizontal-logo.webp";
import LogoSquare from "@/assets/images/nla-logo.webp";

type Props = {
  collapsed: boolean;
  /** Mobile sheet variant — disables collapse logic, always shows expanded */
  variant?: "rail" | "drawer";
  onNavigate?: () => void;
};

export function StudentSidebar({ collapsed, variant = "rail", onNavigate }: Props) {
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
          href="/dashboard"
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

      {/* Nav */}
      <nav
        aria-label="Menu peserta didik"
        className="flex-1 overflow-hidden px-3 pb-4 pt-2"
      >
        <ul className="space-y-1">
          {STUDENT_NAV_ITEMS.map((item) => (
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
            Belajar dengan pace kamu. Akses seumur hidup.
          </p>
        </div>
      ) : null}
    </aside>
  );
}
