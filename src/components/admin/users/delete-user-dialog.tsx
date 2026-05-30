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
  userName: string;
  deleting: boolean;
  onConfirm: () => void;
};

/**
 * Confirmation before soft-deleting a user (PRD §6.11.4). The account row is
 * retained for audit but hidden from the list and blocked from login.
 */
export function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  deleting,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Hapus pengguna ini?</DialogTitle>
          <DialogDescription>
            Akun{" "}
            <span className="font-semibold text-foreground">“{userName}”</span>{" "}
            akan dihapus dan tidak lagi muncul di daftar maupun bisa login.
            Datanya tetap disimpan untuk keperluan audit, namun tindakan ini
            tidak dapat dibatalkan dari panel.
          </DialogDescription>
        </DialogHeader>
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
            {deleting ? "Menghapus…" : "Hapus Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
