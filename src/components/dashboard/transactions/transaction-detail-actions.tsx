"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Timer } from "lucide-react";

import { cn } from "@/lib/utils";

const primaryBtn = cn(
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
  "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
  "hover:bg-[color:var(--color-brand-600)]",
  "disabled:cursor-not-allowed disabled:opacity-70",
);

/**
 * PENDING → resume payment. Links to the checkout page (`/checkout/[slug]`),
 * which detects the live PENDING order and reopens the Midtrans Snap popup with
 * the stored token (no separate payment page anymore).
 */
export function ContinuePaymentButton({ slug }: { slug: string }) {
  return (
    <Link href={`/checkout/${slug}`} className={primaryBtn}>
      <ArrowUpRight className="size-4" strokeWidth={2.4} />
      <span>Lanjutkan Pembayaran</span>
    </Link>
  );
}

function chipClass(isExpired: boolean) {
  return cn(
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tabular-nums ring-1 ring-inset",
    isExpired
      ? "bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10"
      : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  );
}

/**
 * Live MM:SS countdown to the 60-minute checkout deadline (PRD §6.4).
 *
 * The remaining time is computed only on the client (in an effect), never in
 * the `useState` initializer — calling `Date.now()` during render produces
 * different server vs. client values and triggers a hydration mismatch. Until
 * the first tick we render a stable `--:--` placeholder. `onExpire` fires once
 * when the timer reaches zero.
 */
export function PendingCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    firedRef.current = false;
    const tick = () => {
      const next = Math.max(0, target - Date.now());
      setRemaining(next);
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  }, [target]);

  if (remaining === null) {
    return (
      <div className={chipClass(false)}>
        <Timer className="size-4" strokeWidth={2.4} />
        <span>Sisa waktu --:--</span>
      </div>
    );
  }

  const isExpired = remaining <= 0;
  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return (
    <div className={chipClass(isExpired)}>
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
