import Image from "next/image";
import Link from "next/link";

import { AuthBrandPanel } from "./_components/brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1fr_minmax(0,1.05fr)]">
      {/* Left: form column. Wordmark lives here so it is visible at every
          breakpoint; the brand panel on the right is hidden on small screens. */}
      <main className="relative flex flex-col bg-white px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <Link
          href="/"
          aria-label="NextLevel Academy beranda"
          className="-ml-3 -mt-4 inline-flex w-fit items-center sm:-ml-5 sm:-mt-5 lg:-ml-10 lg:-mt-9"
        >
          <Image
            src="/NextLevel_LogoFit.webp"
            alt="NextLevel Academy"
            width={240}
            height={64}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="text-muted-foreground text-center text-xs">
          © {new Date().getFullYear()} NextLevel Academy
        </footer>
      </main>

      <AuthBrandPanel />
    </div>
  );
}
