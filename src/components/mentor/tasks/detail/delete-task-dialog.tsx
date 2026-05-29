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
  taskTitle: string;
  deleting: boolean;
  onConfirm: () => void;
};

/** Destructive confirmation before permanently deleting a task. */
export function DeleteTaskDialog({
  open,
  onOpenChange,
  taskTitle,
  deleting,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Hapus tugas ini?</DialogTitle>
          <DialogDescription>
            Tugas <span className="font-semibold text-foreground">“{taskTitle}”</span> dan
            semua pengumpulan peserta akan dihapus permanen. Tindakan ini tidak
            dapat dibatalkan.
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
          <Button type="button" variant="destructive" disabled={deleting} onClick={onConfirm}>
            {deleting ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : null}
            {deleting ? "Menghapus…" : "Hapus Tugas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
