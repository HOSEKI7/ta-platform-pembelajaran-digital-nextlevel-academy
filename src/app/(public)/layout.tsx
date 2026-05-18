import { getSession } from "@/lib/auth-server";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <PublicNavbar session={session} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
