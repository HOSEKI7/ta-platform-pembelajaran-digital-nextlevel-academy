"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowUpRight, Loader2, Timer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelOrder } from "@/hooks/use-cancel-order";
import { cn } from "@/lib/utils";

const primaryBtn = cn(
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
  "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
  "hover:bg-[color:var(--color-brand-600)]",
  "disabled:cursor-not-allowed disabled:opacity-70",
);

const cancelBtn = cn(
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition",
  "bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50",
  "dark:bg-transparent dark:text-red-400 dark:ring-red-500/30 dark:hover:bg-red-500/10",
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

/**
 * Cancels a PENDING order (wrong-method recovery) behind a confirmation popup.
 * On success the order becomes FAILED — freeing the double-purchase guard — and
 * we land on the transaction detail (now terminal) so the user can re-checkout.
 */
export function CancelPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCancelOrder(orderId);

  function handleConfirm() {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("Pembayaran dibatalkan. Kamu bisa membeli kursus ini lagi.");
        setOpen(false);
        router.replace(`/transactions/${orderId}`);
        router.refresh();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Gagal membatalkan pembayaran.",
        );
      },
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cancelBtn}>
        <X className="size-4" strokeWidth={2.4} />
        <span>Batalkan Pembayaran</span>
      </button>

      <Dialog open={open} onOpenChange={(next) => (isPending ? null : setOpen(next))}>
        <DialogContent>
          <DialogHeader>
            <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
              <AlertTriangle className="size-5" strokeWidth={2.2} />
            </span>
            <DialogTitle>Batalkan pembayaran ini?</DialogTitle>
            <DialogDescription>
              Pesanan akan dibatalkan dan ditandai gagal. Kamu bisa melakukan
              checkout ulang untuk kursus yang sama dengan metode pembayaran
              lain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : null}
              {isPending ? "Membatalkan…" : "Ya, batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
 * when the timer reaches zero (the detail page uses it to refresh into the
 * terminal state).
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
