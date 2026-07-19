"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import type { Role } from "@/generated/prisma";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { NavScrollEffect } from "./nav-scroll-effect";
import { PUBLIC_NAV_LINKS, dashboardHrefFor } from "./public-nav-config";

export function PublicNavbar() {
  const { data: session } = useSession();
  const user = (session?.user ?? null) as {
    id: string;
    name: string;
    email: string;
    role: Role;
    image?: string | null;
  } | null;

  return (
    <>
      <NavScrollEffect />
      <header
        data-nav-root
        data-scrolled="false"
        className={cn(
          "sticky top-0 z-40 w-full transition-[background-color,box-shadow,backdrop-filter] duration-300",
          // Default (top of page): mostly transparent over hero
          "bg-white/60 backdrop-blur-md",
          // Scrolled: solid white + subtle shadow + thin brand line
          "data-[scrolled=true]:bg-white/95 data-[scrolled=true]:shadow-[0_8px_30px_-18px_rgba(35,65,137,0.18)]",
        )}
      >
        {/* Hairline brand-blue bottom rule that intensifies on scroll */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r",
            "from-transparent via-[color:var(--color-brand-200)] to-transparent",
            "opacity-60 group-data-[scrolled=true]/nav:opacity-100",
          )}
        />

        {/* Width caps + gutters MUST mirror SiteContainer so the navbar edges
            line up with section content at every breakpoint. */}
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-[clamp(1.25rem,4vw,2.5rem)] sm:h-[68px] min-[1280px]:max-w-[1360px] min-[1536px]:max-w-[1480px] min-[1920px]:h-[72px] min-[1920px]:max-w-[1600px] min-[1920px]:px-14 min-[2560px]:max-w-[1840px]">
          {/* LEFT: Wordmark */}
          <Link
            href="/"
            aria-label="NextLevel Academy beranda"
            className="group inline-flex shrink-0 items-center"
          >
            <Image
              src="/nla-horizontal-logo.webp"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              sizes="(max-width: 640px) 160px, (max-width: 1920px) 176px, 192px"
              className="h-10 w-auto sm:h-11 min-[1920px]:h-12"
            />
          </Link>

          {/* CENTER: Nav links (lg+). Pill background with subtle divider dots.
              Below lg the full link set + auth buttons can't fit (esp. at the
              768–1023 tablet band → horizontal overflow), so tablet falls back
              to the hamburger sheet like mobile. */}
          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1.5 ring-1 ring-zinc-200/80 backdrop-blur">
              {PUBLIC_NAV_LINKS.map((link, idx) => (
                <li key={link.href} className="flex items-center">
                  <span className="px-2.5">
                    <NavLink
                      href={link.href}
                      exact={link.exact}
                      disabled={link.disabled}
                      comingSoon={link.comingSoon}
                    >
                      {link.label}
                    </NavLink>
                  </span>
                  {idx < PUBLIC_NAV_LINKS.length - 1 ? (
                    <span
                      aria-hidden
                      className="size-1 rounded-full bg-zinc-200"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT: Auth-aware actions */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {user ? (
              <Link
                href={dashboardHrefFor(user.role)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buka dashboard di tab baru"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)] lg:inline-flex"
              >
                Dashboard
                <ArrowUpRight className="size-4" strokeWidth={2.4} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 lg:inline-flex"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(43,114,234,0.7)] transition hover:translate-y-[-1px] hover:bg-[color:var(--color-brand-600)] lg:inline-flex"
                >
                  Daftar Gratis
                  <Sparkles className="size-4 text-[color:var(--color-brand-accent)]" />
                </Link>
              </>
            )}

            {/* Mobile sheet trigger */}
            <MobileNav user={user} />
          </div>
        </div>
      </header>
    </>
  );
}
