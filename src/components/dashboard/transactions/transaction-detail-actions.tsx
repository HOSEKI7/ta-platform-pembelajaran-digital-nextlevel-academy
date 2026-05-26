"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Timer } from "lucide-react";

import { cn } from "@/lib/utils";

const primaryBtn = cn(
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
  "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
  "hover:bg-[color:var(--color-brand-600)]",
  "disabled:cursor-not-allowed disabled:opacity-70",
);

/**
 * PENDING → resume payment. Links to the branded payment page
 * (`/payment/[orderId]`), which loads the stored Snap token and opens the
 * Midtrans popup (or the dev simulate button when Midtrans isn't configured).
 */
export function ContinuePaymentButton({ orderId }: { orderId: string }) {
  return (
    <Link href={`/payment/${orderId}`} className={primaryBtn}>
      <ArrowUpRight className="size-4" strokeWidth={2.4} />
      <span>Lanjutkan Pembayaran</span>
    </Link>
  );
}

/** Live MM:SS countdown to the 60-minute checkout deadline (PRD §6.4). */
export function PendingCountdown({ expiresAt }: { expiresAt: string }) {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target - Date.now()),
  );

  useEffect(() => {
    const handle = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(handle);
  }, [target]);

  const isExpired = remaining <= 0;
  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tabular-nums ring-1 ring-inset",
        isExpired
          ? "bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10"
          : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
      )}
    >
      <Timer className="size-4" strokeWidth={2.4} />
      {isExpired ? (
        <span>Waktu pembayaran habis</span>
      ) : (
        <span>
          Sisa waktu {mm}:{ss}
        </span>
      )}
    </div>
  );
}
