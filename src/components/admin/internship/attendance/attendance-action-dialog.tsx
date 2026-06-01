"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatLongID } from "@/components/mentor/student-attendance/attendance-format";
import type { SettableStatus } from "@/lib/admin-internship-attendance-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  dateISO: string;
  target: SettableStatus;
  processing: boolean;
  onConfirm: () => void;
};

/**
 * Confirmation before an admin overrides one person's attendance (PRD §6.11).
 * Required confirmation for Update per the project conventions.
 */
export function AttendanceActionDialog({
  open,
  onOpenChange,
  name,
  dateISO,
  target,
  processing,
  onConfirm,
}: Props) {
  const isPresent = target === "HADIR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span
            className={
              isPresent
                ? "grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30"
                : "grid size-10 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30"
            }
          >
            {isPresent ? (
              <CheckCircle2 className="size-5" strokeWidth={2.2} />
            ) : (
              <XCircle className="size-5" strokeWidth={2.2} />
            )}
          </span>
          <DialogTitle>
            Tandai {isPresent ? "Hadir" : "Tidak Hadir"}?
          </DialogTitle>
          <DialogDescription>
            Absensi{" "}
            <span className="font-semibold text-foreground">{name}</span> pada{" "}
            <span className="font-semibold text-foreground">
              {formatLongID(dateISO)}
            </span>{" "}
            akan diubah menjadi{" "}
            <span className="font-semibold">
              {isPresent ? "Hadir" : "Tidak Hadir"}
            </span>
            {isPresent
              ? " dengan waktu absen disetel ke waktu saat ini (WIB)."
              : "."}{" "}
            Perubahan tercatat di log audit.
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
            disabled={processing}
            onClick={onConfirm}
            className={
              isPresent
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }
          >
            {processing ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : null}
            {processing
              ? "Menyimpan…"
              : isPresent
                ? "Tandai Hadir"
                : "Tandai Tidak Hadir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
