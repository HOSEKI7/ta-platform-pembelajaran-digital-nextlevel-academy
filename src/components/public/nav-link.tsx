"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

export function NavLink({
  href,
  children,
  exact = false,
  disabled = false,
  comingSoon = false,
}: Props) {
  const pathname = usePathname();
  const active =
    !disabled &&
    (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Segera hadir"
        className="group relative inline-flex cursor-not-allowed items-center gap-1.5 px-1 py-1.5 text-sm font-medium text-zinc-400"
      >
        <span>{children}</span>
        {comingSoon ? (
          <span className="rounded-full bg-[color:var(--color-brand-accent)]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-accent)]/40">
            Soon
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center px-1 py-1.5 text-sm font-medium transition-colors",
        active ? "text-[color:var(--color-brand-900)]" : "text-zinc-600 hover:text-zinc-900",
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full transition-all duration-300 ease-out",
          active
            ? "w-full bg-[color:var(--color-brand-500)]"
            : "w-0 bg-[color:var(--color-brand-500)]/70 group-hover:w-full",
        )}
      />
      {active ? (
        <span
          aria-hidden
          className="absolute -bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"
        />
      ) : null}
    </Link>
  );
}
