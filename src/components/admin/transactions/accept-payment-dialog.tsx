"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

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
 * Confirmation before manually accepting a PENDING payment. Mirrors a real
 * gateway success: the order becomes SUCCESS, the enrollment is granted, and a
 * confirmation email is sent — so warn the admin it can't be undone.
 */
export function AcceptPaymentDialog({
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
          <span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30">
            <CheckCircle2 className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Terima pembayaran ini?</DialogTitle>
          <DialogDescription>
            Pembayaran untuk{" "}
            <span className="font-semibold text-foreground">
              “{courseTitle}”
            </span>{" "}
            akan ditandai <span className="font-semibold">berhasil</span>.
            Peserta langsung mendapat akses kursus dan email konfirmasi dikirim.
            Tindakan ini tidak dapat dibatalkan.
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
            disabled={processing}
            onClick={onConfirm}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {processing ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {processing ? "Memproses…" : "Terima Pembayaran"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
