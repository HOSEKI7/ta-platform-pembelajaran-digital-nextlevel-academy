"use client";

import { Ban, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  processing: boolean;
  onConfirm: () => void;
};

/**
 * Confirmation before cancelling a PENDING payment. The order is marked FAILED
 * (no enrollment granted) and the student is notified.
 */
export function CancelPaymentDialog({
  open,
  onOpenChange,
  courseTitle,
  processing,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30">
            <Ban className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Batalkan pembayaran ini?</DialogTitle>
          <DialogDescription>
            Pembayaran untuk{" "}
            <span className="font-semibold text-foreground">
              “{courseTitle}”
            </span>{" "}
            akan ditandai <span className="font-semibold">gagal</span>. Peserta
            tidak mendapat akses kursus dan akan menerima notifikasi pembatalan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={processing}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={processing}
            onClick={onConfirm}
          >
            {processing ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {processing ? "Memproses…" : "Batalkan Pembayaran"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
