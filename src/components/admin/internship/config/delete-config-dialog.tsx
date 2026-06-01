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
  /** What is being deleted, e.g. "batch", "bidang", "kelas". */
  entityLabel: string;
  /** The specific item's display name. */
  itemName: string;
  /** True when the row already shows references → block + warn up-front. */
  blocked: boolean;
  /** Inline hint shown when blocked (and/or server 409 message). */
  blockedHint?: string;
  deleting: boolean;
  /** Server error (e.g. 409) — keeps the dialog open. */
  error: string | null;
  onConfirm: () => void;
};

/**
 * Shared destructive confirmation for Batch / Bidang / Kelas. The server blocks
 * deletion while descendants/usage remain (409); when the row already shows
 * usage we disable the button and warn up-front, and any server error stays
 * inline so the admin can empty it first.
 */
export function DeleteConfigDialog({
  open,
  onOpenChange,
  entityLabel,
  itemName,
  blocked,
  blockedHint,
  deleting,
  error,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Hapus {entityLabel} ini?</DialogTitle>
          <DialogDescription>
            {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}{" "}
            <span className="font-semibold text-foreground">{itemName}</span> akan
            dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            {blocked && blockedHint ? ` ${blockedHint}` : ""}
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
            disabled={deleting || blocked}
            onClick={onConfirm}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {deleting ? "Menghapus…" : `Hapus ${entityLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
