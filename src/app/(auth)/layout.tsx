import Image from "next/image";
import Link from "next/link";

import { AuthBrandPanel } from "./_components/brand-panel";
import { ForceLightTheme } from "./_components/force-light-theme";
import "./auth.css";
import LogoHorizontal from "@/assets/images/nla-horizontal-logo.webp";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // ponytail: auth-page redirect handled by proxy.ts (cookie-only, no DB).

  return (
    <>
      {/* ForceLightTheme keeps `dark` off <html> for the entire mount; the
          `auth-light-scope` class re-declares CSS vars locally as a safety
          net so any descendant primitive renders with light values. */}
      <ForceLightTheme />
      {/* `100svh` (small viewport height) is used instead of `min-h-screen`
          (`100vh`) so the layout tracks the REAL visible viewport on mobile —
          `100vh` includes the area behind the address bar, which overflows and
          forces a scroll / hides the footer. On `lg+` the split is pinned to the
          exact viewport height so the brand panel (already `overflow-hidden`) is
          bounded and the two columns share one height. */}
      <div className="auth-light-scope grid min-h-[100svh] w-full lg:h-[100svh] lg:grid-cols-[1fr_minmax(0,1.05fr)]">
        {/* Left: form column — a viewport-bounded flex column with three zones:
            logo (fixed) · content (centers + scrolls) · footer (fixed).

            The middle zone is the scroll container: it `m-auto`-centers the form
            when there's spare height (the common case → no scroll anywhere), and
            scrolls INTERNALLY when the form is taller than the viewport (very
            short / zoomed screens), keeping the top reachable so nothing is ever
            cut off. `min-h-0` lets this flex child shrink below its content so
            the overflow actually engages. Single `py` rhythm (no doubled padding
            with the inner wrapper) preserves the vertical budget. */}
        <main className="relative flex min-h-[100svh] flex-col bg-white px-6 py-5 sm:px-10 sm:py-6 lg:min-h-0 lg:px-16 min-[1920px]:px-24 min-[1920px]:py-10">
          <Link
            href="/"
            aria-label="NextLevel Academy beranda"
            className="-ml-3 inline-flex w-fit shrink-0 items-center sm:-ml-5 lg:-ml-10 min-[1920px]:-ml-14"
          >
            <Image
              src={LogoHorizontal} placeholder="blur"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              className="h-11 w-auto sm:h-12 min-[1920px]:h-14"
            />
          </Link>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="m-auto w-full max-w-md py-4 sm:py-5 min-[1920px]:max-w-[600px] min-[1920px]:py-8">
              {children}
            </div>
          </div>

          <footer className="text-muted-foreground shrink-0 text-center text-xs min-[1920px]:text-sm">
            © {new Date().getFullYear()} NextLevel Academy
          </footer>
        </main>

        <AuthBrandPanel />
      </div>
    </>
  );
}
