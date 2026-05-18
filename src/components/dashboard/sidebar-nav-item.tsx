"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  exact,
  collapsed,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_12px_30px_-14px_rgba(43,114,234,0.7)]"
          : "text-zinc-700 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-900)] dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon
        className={cn(
          "size-5 shrink-0 transition",
          active ? "text-white" : "text-zinc-500 group-hover:text-[color:var(--color-brand-700)] dark:text-zinc-300 dark:group-hover:text-white",
        )}
        strokeWidth={2.1}
      />
      {!collapsed ? <span className="flex-1 truncate">{label}</span> : null}
      {active && !collapsed ? (
        <span
          aria-hidden
          className="ml-1 size-1.5 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_8px_var(--color-brand-accent)]"
        />
      ) : null}
      {active && collapsed ? (
        <span
          aria-hidden
          className="absolute -right-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_8px_var(--color-brand-accent)]"
        />
      ) : null}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right" sideOffset={10} className="font-semibold">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
