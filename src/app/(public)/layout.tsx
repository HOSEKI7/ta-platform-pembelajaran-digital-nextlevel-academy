import { Suspense } from "react";

import { getSession } from "@/lib/auth-server";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

// ponytail: navbar session fetched lazily so layout resolves instantly
async function NavbarWithSession() {
  const session = await getSession();
  return <PublicNavbar session={session} />;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <Suspense
        fallback={
          <div className="h-16 sm:h-[68px] min-[1920px]:h-[72px]" />
        }
      >
        <NavbarWithSession />
      </Suspense>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
