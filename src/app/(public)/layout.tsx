import { BUNNY_CDN_HOST } from "@/lib/bunny-host";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      {BUNNY_CDN_HOST ? (
        <>
          <link rel="dns-prefetch" href={`https://${BUNNY_CDN_HOST}`} />
          <link rel="preconnect" href={`https://${BUNNY_CDN_HOST}`} />
        </>
      ) : null}
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
