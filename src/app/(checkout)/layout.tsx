import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { ForceLightTheme } from "../(auth)/_components/force-light-theme";
import { CheckoutTopBar } from "./_components/checkout-top-bar";

/**
 * Fullscreen checkout shell — no sidebar, no bottom nav. Mirrors the auth
 * layout's pattern of stripping global chrome (sidebar, dashboard topbar)
 * so the student focuses on completing the transaction.
 *
 * Light-mode only: trust signals (lock icons, badges) read clearer on a
 * white surface, and the brand panels we render aren't designed for dark.
 */
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Role gate happens at layout level — every page inside `(checkout)`
  // inherits the PESERTA_DIDIK requirement.
  await requireRole(Role.PESERTA_DIDIK);

  return (
    <>
      <ForceLightTheme />
      <div className="auth-light-scope relative min-h-screen w-full bg-[color:var(--color-brand-50)]/40">
        {/* Subtle radial accent so the surface doesn't read as flat. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-white via-white to-transparent"
        />
        <CheckoutTopBar />
        <main className="pt-8 sm:pt-10">{children}</main>
        <footer className="border-t border-zinc-200 bg-white/60 py-6">
          <div className="mx-auto max-w-6xl px-5 text-center text-[11px] text-zinc-500 sm:px-8 lg:px-10">
            © {new Date().getFullYear()} NextLevel Academy · Semua transaksi
            diproses dan dienkripsi oleh DOKU.
          </div>
        </footer>
      </div>
    </>
  );
}
