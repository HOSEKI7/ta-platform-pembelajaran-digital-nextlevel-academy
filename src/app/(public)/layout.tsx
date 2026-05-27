import { getSession } from "@/lib/auth-server";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // The landing surface is light-only by design — enforced by hardcoded light
  // colors here and in the public components. (The previous nested
  // `ThemeProvider forcedTheme="light"` was a no-op under next-themes, which
  // ignores nested providers, so removing it changes nothing visually.)
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <PublicNavbar session={session} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
