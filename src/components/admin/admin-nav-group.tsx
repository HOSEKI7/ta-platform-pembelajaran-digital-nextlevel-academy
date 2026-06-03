"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { type AdminNavGroup, activeChildHref } from "./admin-sidebar-config";

type Props = {
  group: AdminNavGroup;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  /** Red "new activity" dot on the parent group (e.g. Keuangan → new transaction). */
  showGroupDot?: boolean;
  /** Child hrefs that should carry their own red "new activity" dot. */
  dotChildHrefs?: ReadonlySet<string>;
};

export function AdminNavGroupItem({
  group,
  collapsed,
  open,
  onToggle,
  onNavigate,
  showGroupDot,
  dotChildHrefs,
}: Props) {
  const pathname = usePathname();
  const activeHref = activeChildHref(pathname, group);
  const groupActive = activeHref !== null;
  const Icon = group.icon;
  const childHasDot = (href: string) => dotChildHrefs?.has(href) ?? false;
  // Hide the parent dot once the group is open — the relevant child dot is now visible.
  const parentDot = showGroupDot && !open;

  // ── Collapsed rail ───────────────────────────────────────────────────────
  // Children stack vertically *directly below* the parent (no horizontal shift),
  // and the whole open group is wrapped in one unified background block.
  if (collapsed) {
    const parentButton = (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={group.label}
        className={cn(
          "group relative flex w-full items-center justify-center rounded-2xl px-2 py-2.5 transition-all",
          groupActive
            ? "text-[color:var(--color-brand-700)] dark:text-white"
            : "text-zinc-700 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-900)] dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
        )}
      >
        <Icon
          className={cn(
            "size-5 shrink-0 transition",
            groupActive
              ? "text-[color:var(--color-brand-600)] dark:text-white"
              : "text-zinc-500 group-hover:text-[color:var(--color-brand-700)] dark:text-zinc-300 dark:group-hover:text-white",
          )}
          strokeWidth={2.1}
        />
        {/* Chevron indicator that this item has children */}
        <ChevronDown
          aria-hidden
          className={cn(
            "absolute bottom-1 right-1.5 size-3 text-zinc-400 transition-transform duration-200 dark:text-zinc-500",
            open ? "rotate-0" : "-rotate-90",
          )}
          strokeWidth={2.6}
        />
        {parentDot ? (
          <span
            aria-label="Aktivitas baru"
            className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[color:var(--color-error)] ring-2 ring-white dark:ring-[color:var(--color-surface-nav)]"
          />
        ) : null}
      </button>
    );

    return (
      <div
        className={cn(
          "flex flex-col items-stretch transition-colors",
          open &&
            "gap-0.5 rounded-2xl bg-[color:var(--color-brand-50)]/70 p-1 ring-1 ring-[color:var(--color-brand-100)] dark:bg-white/[0.04] dark:ring-white/10",
        )}
      >
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger render={parentButton} />
            <TooltipContent side="right" sideOffset={10} className="font-semibold">
              {group.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {open
          ? group.children.map((child) => {
              const ChildIcon = child.icon;
              const active = child.href === activeHref;
              const childLink = (
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center justify-center rounded-xl px-2 py-2 transition-all",
                    active
                      ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_12px_30px_-14px_rgba(43,114,234,0.7)]"
                      : "text-zinc-600 hover:bg-white hover:text-[color:var(--color-brand-900)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
                  )}
                >
                  <ChildIcon
                    className={cn(
                      "size-[18px] shrink-0",
                      active
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-[color:var(--color-brand-700)] dark:text-zinc-300 dark:group-hover:text-white",
                    )}
                    strokeWidth={2.1}
                  />
                  {childHasDot(child.href) ? (
                    <span
                      aria-label="Aktivitas baru"
                      className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[color:var(--color-error)] ring-2 ring-white dark:ring-[color:var(--color-surface-nav)]"
                    />
                  ) : null}
                </Link>
              );
              return (
                <TooltipProvider key={child.href} delay={200}>
                  <Tooltip>
                    <TooltipTrigger render={childLink} />
                    <TooltipContent side="right" sideOffset={10} className="font-semibold">
                      {child.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })
          : null}
      </div>
    );
  }

  // ── Expanded rail ────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "transition-colors",
        open &&
          "rounded-2xl bg-[color:var(--color-brand-50)]/60 p-1 ring-1 ring-[color:var(--color-brand-100)] dark:bg-white/[0.04] dark:ring-white/10",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
          groupActive
            ? "text-[color:var(--color-brand-900)] dark:text-white"
            : "text-zinc-700 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-900)] dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
          open && "bg-transparent hover:bg-white/60 dark:hover:bg-white/[0.06]",
        )}
      >
        <Icon
          className={cn(
            "size-5 shrink-0 transition",
            groupActive
              ? "text-[color:var(--color-brand-600)] dark:text-white"
              : "text-zinc-500 group-hover:text-[color:var(--color-brand-700)] dark:text-zinc-300 dark:group-hover:text-white",
          )}
          strokeWidth={2.1}
        />
        <span className="flex-1 truncate text-left">{group.label}</span>
        {parentDot ? (
          <span
            aria-label="Aktivitas baru"
            className="size-2 rounded-full bg-[color:var(--color-error)] ring-2 ring-white dark:ring-[color:var(--color-surface-nav)]"
          />
        ) : groupActive && !open ? (
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_8px_var(--color-brand-accent)]"
          />
        ) : null}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-zinc-400 transition-transform duration-200 dark:text-zinc-500",
            open ? "rotate-0" : "-rotate-90",
          )}
          strokeWidth={2.4}
        />
      </button>

      {open ? (
        <ul className="mt-0.5 ms-[1.4rem] space-y-0.5 border-l border-[color:var(--color-brand-200)] py-0.5 ps-2 dark:border-white/10">
          {group.children.map((child) => {
            const ChildIcon = child.icon;
            const active = child.href === activeHref;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all",
                    active
                      ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_12px_30px_-14px_rgba(43,114,234,0.7)]"
                      : "text-zinc-600 hover:bg-white hover:text-[color:var(--color-brand-900)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
                  )}
                >
                  <ChildIcon
                    className={cn(
                      "size-4 shrink-0 transition",
                      active
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-[color:var(--color-brand-700)] dark:text-zinc-300 dark:group-hover:text-white",
                    )}
                    strokeWidth={2.1}
                  />
                  <span className="flex-1 truncate">{child.label}</span>
                  {childHasDot(child.href) ? (
                    <span
                      aria-label="Aktivitas baru"
                      className="size-2 shrink-0 rounded-full bg-[color:var(--color-error)] ring-2 ring-white dark:ring-[color:var(--color-surface-nav)]"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
