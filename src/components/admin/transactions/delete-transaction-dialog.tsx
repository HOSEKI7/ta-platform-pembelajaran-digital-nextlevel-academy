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
  processing: boolean;
  onConfirm: () => void;
};

/**
 * Soft-delete confirmation. The transaction is removed from the admin list but
 * the row is retained for audit (PRD §6.11.5).
 */
export function DeleteTransactionDialog({
  open,
  onOpenChange,
  processing,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Hapus transaksi ini?</DialogTitle>
          <DialogDescription>
            Transaksi akan dihilangkan dari daftar transaksi. Datanya tetap
            disimpan untuk keperluan audit dan tidak menghapus enrollment yang
            sudah aktif.
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
            {processing ? "Menghapus…" : "Hapus Transaksi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
