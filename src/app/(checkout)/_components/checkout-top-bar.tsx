import Image from "next/image";
import Link from "next/link";
import { Clock3, ShieldCheck } from "lucide-react";
import LogoHorizontal from "@/assets/images/nla-horizontal-logo.webp";

/**
 * Minimal chrome that sits above the checkout content. Intentionally NOT a
 * full dashboard sidebar / header — checkout is its own surface, and
 * stripping navigation reduces drop-off and accidental exits during payment.
 *
 * The expiry chip currently shows a static "60 menit" hint; once orders are
 * actually created (and the page knows the orderId/expiresAt), a future
 * iteration can live-tick from the order's `expiresAt`.
 */
export function CheckoutTopBar() {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/dashboard"
          aria-label="Kembali ke dashboard NextLevel Academy"
          className="-ml-2 inline-flex items-center"
        >
          <Image
            src={LogoHorizontal} placeholder="blur"
            alt="NextLevel Academy"
            width={1397}
            height={351}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-[color:var(--color-success)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-success)] ring-1 ring-[color:var(--color-success)]/20 sm:inline-flex">
            <ShieldCheck className="size-3.5" strokeWidth={2.6} />
            Pembayaran Aman
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-600 ring-1 ring-zinc-200">
            <Clock3 className="size-3.5" strokeWidth={2.6} />
            Berlaku 60 menit
          </span>
        </div>
      </div>
    </header>
  );
}
