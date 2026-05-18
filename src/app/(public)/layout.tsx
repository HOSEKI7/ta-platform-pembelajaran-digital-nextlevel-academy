import { getSession } from "@/lib/auth-server";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <ThemeProvider forcedTheme="light" attribute="class" enableSystem={false}>
      <div className="flex min-h-screen flex-col bg-white text-zinc-900">
        <PublicNavbar session={session} />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </ThemeProvider>
  );
}
