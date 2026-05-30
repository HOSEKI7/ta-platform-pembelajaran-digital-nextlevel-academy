"use client";

import { Loader2, Power, PowerOff } from "lucide-react";

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
  voucherCode: string;
  /** Current active state — drives whether this deactivates or reactivates. */
  isActive: boolean;
  pending: boolean;
  onConfirm: () => void;
};

/**
 * Confirmation before toggling a voucher's active state. When active →
 * deactivate (voucher stops being redeemable); when inactive → reactivate.
 */
export function DeactivateVoucherDialog({
  open,
  onOpenChange,
  voucherCode,
  isActive,
  pending,
  onConfirm,
}: Props) {
  const deactivating = isActive;
  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <span
            className={
              deactivating
                ? "grid size-10 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30"
                : "grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30"
            }
          >
            {deactivating ? (
              <PowerOff className="size-5" strokeWidth={2.2} />
            ) : (
              <Power className="size-5" strokeWidth={2.2} />
            )}
          </span>
          <DialogTitle>
            {deactivating
              ? "Nonaktifkan voucher ini?"
              : "Aktifkan kembali voucher ini?"}
          </DialogTitle>
          <DialogDescription>
            Voucher{" "}
            <span className="font-mono font-semibold text-foreground">
              {voucherCode}
            </span>{" "}
            {deactivating
              ? "tidak akan bisa dipakai peserta sampai diaktifkan kembali. Data dan riwayat pemakaian tetap tersimpan."
              : "akan kembali bisa dipakai peserta selama masih dalam masa berlaku."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant={deactivating ? "destructive" : "default"}
            disabled={pending}
            onClick={onConfirm}
            className={
              deactivating
                ? undefined
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {pending
              ? "Memproses…"
              : deactivating
                ? "Nonaktifkan"
                : "Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
