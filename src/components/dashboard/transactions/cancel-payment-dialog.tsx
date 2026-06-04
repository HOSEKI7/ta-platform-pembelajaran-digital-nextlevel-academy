"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ban, Loader2, XCircle } from "lucide-react";

import { useCancelOrderMutation } from "@/hooks/use-cancel-order";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
  courseTitle: string;
};

/**
 * Self-cancel a PENDING payment from the transaction detail page (PRD §6.4).
 * Renders an outline trigger + confirmation dialog. On success the order becomes
 * CANCELED and the student can checkout again right away (no 60-min wait).
 */
export function CancelPaymentButton({ orderId, courseTitle }: Props) {
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelOrderMutation(orderId);

  function handleConfirm() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Pembayaran dibatalkan. Kamu bisa checkout ulang kapan saja.");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Gagal membatalkan pembayaran.");
      },
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition",
          "border border-zinc-200 text-zinc-600 hover:bg-zinc-50",
          "dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5",
        )}
      >
        <XCircle className="size-4" strokeWidth={2.4} />
        <span>Batalkan Pembayaran</span>
      </button>

      <Dialog open={open} onOpenChange={(next) => !cancelMutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <span className="grid size-10 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30">
              <Ban className="size-5" strokeWidth={2.2} />
            </span>
            <DialogTitle>Batalkan pembayaran ini?</DialogTitle>
            <DialogDescription>
              Pesanan untuk{" "}
              <span className="font-semibold text-foreground">“{courseTitle}”</span>{" "}
              akan dibatalkan dan tidak ada biaya yang ditagihkan. Kamu bisa{" "}
              <span className="font-semibold">membeli kembali</span> kursus ini kapan
              saja tanpa menunggu pesanan kedaluwarsa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={cancelMutation.isPending}
              onClick={() => setOpen(false)}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={handleConfirm}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : null}
              {cancelMutation.isPending ? "Memproses…" : "Batalkan Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
