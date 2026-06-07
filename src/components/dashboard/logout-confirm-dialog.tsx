"use client";

import { Loader2, LogOut } from "lucide-react";

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
  loading: boolean;
  onConfirm: () => void;
};

/** Confirmation shown before signing the user out. Reused by the role topbars
 *  (ProfileMenu) and the public mobile nav. */
export function LogoutConfirmDialog({ open, onOpenChange, loading, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <LogOut className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Keluar dari akun?</DialogTitle>
          <DialogDescription>
            Kamu akan keluar dari sesi ini dan perlu login lagi untuk masuk kembali.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="button" variant="destructive" disabled={loading} onClick={onConfirm}>
            {loading ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : null}
            {loading ? "Mengeluarkan…" : "Logout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
