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
  courseTitle: string;
  deleting: boolean;
  onConfirm: () => void;
};

/**
 * Destructive confirmation before permanently deleting a course. The server
 * still blocks deletion when enrollments/orders exist — this dialog only guards
 * the empty-course case the admin can actually remove.
 */
export function DeleteCourseDialog({
  open,
  onOpenChange,
  courseTitle,
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
          <DialogTitle>Hapus kursus ini?</DialogTitle>
          <DialogDescription>
            Kursus{" "}
            <span className="font-semibold text-foreground">
              “{courseTitle}”
            </span>{" "}
            beserta seluruh sprint, tahap, dan materinya akan dihapus permanen.
            Tindakan ini tidak dapat dibatalkan. Kursus yang sudah memiliki
            peserta tidak dapat dihapus — arsipkan saja.
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
            {deleting ? "Menghapus…" : "Hapus Kursus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
