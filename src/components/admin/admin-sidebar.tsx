"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SidebarNavItem } from "@/components/dashboard/sidebar-nav-item";

import { ADMIN_NAV_ITEMS, findActiveGroupLabel } from "./admin-sidebar-config";
import { AdminNavGroupItem } from "./admin-nav-group";

type Props = {
  collapsed: boolean;
  /** Mobile sheet variant — disables collapse logic, always shows expanded */
  variant?: "rail" | "drawer";
  onNavigate?: () => void;
};

export function AdminSidebar({ collapsed, variant = "rail", onNavigate }: Props) {
  const isDrawer = variant === "drawer";
  const isCollapsed = !isDrawer && collapsed;

  // Accordion state: at most one group open. Auto-opens the group containing the
  // active route, and re-syncs whenever navigation lands inside another group.
  // Synced during render (React's "adjust state on prop change" pattern) rather
  // than in an effect, so the open group never lags a frame behind navigation.
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(() =>
    findActiveGroupLabel(pathname),
  );
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    const active = findActiveGroupLabel(pathname);
    if (active) setOpenGroup(active);
  }

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
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="NextLevel Academy beranda (buka di tab baru)"
          onClick={onNavigate}
          className="inline-flex items-center rounded-xl p-1 transition hover:bg-zinc-100/70 dark:hover:bg-white/5"
        >
          {isCollapsed ? (
            <Image
              src="/NextLevel_Mini_Logo.webp"
              alt="NextLevel Academy"
              width={48}
              height={48}
              className="h-9 w-9 object-contain"
              priority
            />
          ) : (
            <Image
              src="/NextLevel_LogoXFit.webp"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              className="h-11 w-auto object-contain"
            />
          )}
        </Link>
      </div>

      {/* Admin badge — clarifies which app surface this is, since the shell is
          visually near-identical to the other role shells. */}
      {!isCollapsed ? (
        <div className="px-5 pb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            Admin
          </span>
        </div>
      ) : null}

      {/* Nav */}
      <nav aria-label="Menu admin" className="flex-1 overflow-hidden px-3 pb-4 pt-2">
        <ul className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) =>
            item.kind === "leaf" ? (
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
            ) : (
              <li key={item.label}>
                <AdminNavGroupItem
                  group={item}
                  collapsed={isCollapsed}
                  open={openGroup === item.label}
                  onToggle={() =>
                    setOpenGroup((cur) => (cur === item.label ? null : item.label))
                  }
                  onNavigate={onNavigate}
                />
              </li>
            ),
          )}
        </ul>
      </nav>

      {/* Footer microcopy */}
      {!isCollapsed ? (
        <div className="border-t border-zinc-200 px-5 py-4 text-[11px] text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
          <p className="font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            NextLevel Academy
          </p>
          <p className="mt-1 leading-relaxed">
            Kelola platform, pantau metrik.
          </p>
        </div>
      ) : null}
    </aside>
  );
}
