"use client";

import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ForceSubmissionStatus } from "@/lib/admin-internship-tasks-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  target: ForceSubmissionStatus;
  /** Whether the student currently has an uploaded file (affects the warning). */
  hasFile: boolean;
  processing: boolean;
  onConfirm: () => void;
};

/**
 * Confirmation before an admin force-overrides a student's submission status
 * (PRD §6.11 / §6.9.3). Required confirmation for Update per project conventions.
 */
export function ForceStatusDialog({
  open,
  onOpenChange,
  name,
  target,
  hasFile,
  processing,
  onConfirm,
}: Props) {
  const toSubmitted = target === "SUBMITTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span
            className={
              toSubmitted
                ? "grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30"
                : "grid size-10 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30"
            }
          >
            {toSubmitted ? (
              <CheckCircle2 className="size-5" strokeWidth={2.2} />
            ) : (
              <RotateCcw className="size-5" strokeWidth={2.2} />
            )}
          </span>
          <DialogTitle>
            Tandai {toSubmitted ? "Sudah Mengumpulkan" : "Belum Mengumpulkan"}?
          </DialogTitle>
          <DialogDescription>
            Status pengumpulan{" "}
            <span className="font-semibold text-foreground">{name}</span> akan diubah
            menjadi{" "}
            <span className="font-semibold">
              {toSubmitted ? "Terkumpul" : "Belum Dikumpulkan"}
            </span>
            {toSubmitted
              ? " walaupun peserta belum mengunggah berkas."
              : hasFile
                ? ". Berkas yang sudah diunggah tetap disimpan dan dapat dipulihkan."
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
              toSubmitted
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }
          >
            {processing ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : null}
            {processing
              ? "Menyimpan…"
              : toSubmitted
                ? "Tandai Terkumpul"
                : "Tandai Belum"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
