"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

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
  deleting: boolean;
  /** Server error (e.g. 409 "sudah dipakai") — keeps the dialog open. */
  error: string | null;
  onConfirm: () => void;
};

/**
 * Destructive confirmation before permanently deleting a voucher. The server
 * blocks deletion of used vouchers (409) — that message is surfaced inline and
 * the dialog stays open so the admin can choose to deactivate instead.
 */
export function DeleteVoucherDialog({
  open,
  onOpenChange,
  voucherCode,
  deleting,
  error,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Hapus voucher ini?</DialogTitle>
          <DialogDescription>
            Voucher{" "}
            <span className="font-mono font-semibold text-foreground">
              {voucherCode}
            </span>{" "}
            akan dihapus permanen. Tindakan ini tidak dapat dibatalkan. Voucher
            yang sudah pernah dipakai tidak dapat dihapus — nonaktifkan saja.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {deleting ? "Menghapus…" : "Hapus Voucher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
