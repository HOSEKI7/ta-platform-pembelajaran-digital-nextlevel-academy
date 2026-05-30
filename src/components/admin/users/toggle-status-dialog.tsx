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
  userName: string;
  /** Current state — the action flips it. */
  isActive: boolean;
  saving: boolean;
  onConfirm: () => void;
};

/**
 * Confirmation for enabling/disabling an account (PRD §6.11.4 "Nonaktifkan").
 * Disabling blocks login and revokes live sessions; data is retained.
 */
export function ToggleStatusDialog({
  open,
  onOpenChange,
  userName,
  isActive,
  saving,
  onConfirm,
}: Props) {
  const disabling = isActive;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span
            className={
              disabling
                ? "grid size-10 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30"
                : "grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30"
            }
          >
            {disabling ? (
              <PowerOff className="size-5" strokeWidth={2.2} />
            ) : (
              <Power className="size-5" strokeWidth={2.2} />
            )}
          </span>
          <DialogTitle>
            {disabling ? "Nonaktifkan akun ini?" : "Aktifkan kembali akun ini?"}
          </DialogTitle>
          <DialogDescription>
            {disabling ? (
              <>
                Akun{" "}
                <span className="font-semibold text-foreground">
                  “{userName}”
                </span>{" "}
                tidak akan bisa login dan sesi aktifnya dicabut. Datanya tetap
                tersimpan dan bisa diaktifkan kembali kapan saja.
              </>
            ) : (
              <>
                Akun{" "}
                <span className="font-semibold text-foreground">
                  “{userName}”
                </span>{" "}
                akan bisa login kembali menggunakan kredensial yang ada.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant={disabling ? "destructive" : "default"}
            disabled={saving}
            onClick={onConfirm}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {disabling ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
