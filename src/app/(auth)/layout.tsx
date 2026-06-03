import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-server";
import { dashboardPathForRole } from "@/lib/role-routes";

import { AuthBrandPanel } from "./_components/brand-panel";
import { ForceLightTheme } from "./_components/force-light-theme";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already-authenticated users have no business on the auth pages — send them
  // straight to their own role's dashboard (the proxy only does a cheap cookie
  // check and can't read the role at the edge).
  const session = await getSession();
  if (session) {
    redirect(dashboardPathForRole(session.user.role));
  }

  return (
    <>
      {/* ForceLightTheme keeps `dark` off <html> for the entire mount; the
          `auth-light-scope` class re-declares CSS vars locally as a safety
          net so any descendant primitive renders with light values. */}
      <ForceLightTheme />
      <div className="auth-light-scope grid min-h-screen w-full lg:grid-cols-[1fr_minmax(0,1.05fr)]">
        {/* Left: form column. Wordmark lives here so it is visible at every
            breakpoint; the brand panel on the right is hidden on small screens.

            Vertical padding scales with viewport tier:
              - default (≤sm):  py-8 — phone-screen friendly
              - sm / md:        py-10
              - lg (≥1024):     py-6 — compact so 1366×768 fits without scroll
              - xl (≥1280):     py-10
              - 2K (≥1920):     py-20 — generous breathing room on QHD+/UHD
            Previously `lg:py-16` plus the inner wrapper's `py-10` produced
            ~208px of fixed chrome that pushed the register form below the
            fold on 768px laptops. */}
        <main className="relative flex flex-col bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-6 xl:py-10 min-[1920px]:px-24 min-[1920px]:py-20">
          <Link
            href="/"
            aria-label="NextLevel Academy beranda"
            className="-ml-3 -mt-2 inline-flex w-fit items-center sm:-ml-5 sm:-mt-3 lg:-ml-10 lg:-mt-2 xl:-mt-4 min-[1920px]:-ml-14 min-[1920px]:-mt-8"
          >
            <Image
              src="/NextLevel_LogoXFit.webp"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              className="h-11 w-auto sm:h-12 min-[1920px]:h-14"
            />
          </Link>

          <div className="flex flex-1 items-center justify-center py-4 sm:py-6 xl:py-10 min-[1920px]:py-12">
            <div className="w-full max-w-md min-[1920px]:max-w-[600px]">{children}</div>
          </div>

          <footer className="text-muted-foreground text-center text-xs min-[1920px]:text-sm">
            © {new Date().getFullYear()} NextLevel Academy
          </footer>
        </main>

        <AuthBrandPanel />
      </div>
    </>
  );
}
