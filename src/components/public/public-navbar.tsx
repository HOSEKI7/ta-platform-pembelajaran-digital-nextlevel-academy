import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import type { AuthSession } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { NavScrollEffect } from "./nav-scroll-effect";
import { PUBLIC_NAV_LINKS, dashboardHrefFor } from "./public-nav-config";

type Props = { session: AuthSession | null };

export function PublicNavbar({ session }: Props) {
  const user = session?.user ?? null;

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

        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6 sm:h-[68px] sm:px-8 lg:px-10 min-[1920px]:h-[72px] min-[1920px]:max-w-[1480px] min-[1920px]:px-14">
          {/* LEFT: Wordmark */}
          <Link
            href="/"
            aria-label="NextLevel Academy beranda"
            className="group inline-flex shrink-0 items-center"
          >
            <Image
              src="/NextLevel_LogoFit.webp"
              alt="NextLevel Academy"
              width={190}
              height={48}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {/* CENTER: Nav links (md+). Pill background with subtle divider dots. */}
          <nav className="hidden flex-1 items-center justify-center md:flex">
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
                    <span aria-hidden className="size-1 rounded-full bg-zinc-200" />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT: Auth-aware actions */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {user ? (
              <Link
                href={dashboardHrefFor(user.role)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buka dashboard di tab baru"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)] sm:inline-flex"
              >
                Dashboard
                <ArrowUpRight className="size-4" strokeWidth={2.4} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="hidden h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(43,114,234,0.7)] transition hover:translate-y-[-1px] hover:bg-[color:var(--color-brand-600)] sm:inline-flex"
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
