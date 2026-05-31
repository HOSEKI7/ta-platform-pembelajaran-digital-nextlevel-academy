"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import type { AdminCategoryRow } from "@/lib/admin-categories-query";
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
  category: AdminCategoryRow;
  deleting: boolean;
  /** Server error (e.g. 409 "masih dipakai") — keeps the dialog open. */
  error: string | null;
  onConfirm: () => void;
};

/**
 * Destructive confirmation before deleting a category. The server blocks
 * deletion of categories still used by a course/voucher (409); when the row
 * already shows usage we warn up-front, and any server error stays inline so the
 * admin can reassign first.
 */
export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  deleting,
  error,
  onConfirm,
}: Props) {
  const inUse = category.courseCount > 0 || category.voucherCount > 0;
  const usageParts: string[] = [];
  if (category.courseCount > 0) usageParts.push(`${category.courseCount} kursus`);
  if (category.voucherCount > 0)
    usageParts.push(`${category.voucherCount} voucher`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Hapus kategori ini?</DialogTitle>
          <DialogDescription>
            Kategori{" "}
            <span className="font-semibold text-foreground">
              {category.name}
            </span>{" "}
            akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            {inUse
              ? ` Kategori ini masih dipakai ${usageParts.join(
                  " dan ",
                )} — pindahkan dulu sebelum menghapus.`
              : ""}
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
            disabled={deleting || inUse}
            onClick={onConfirm}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {deleting ? "Menghapus…" : "Hapus Kategori"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
