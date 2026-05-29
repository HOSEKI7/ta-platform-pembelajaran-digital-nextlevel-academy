"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  studentName: string | null;
  submitting: boolean;
  onSubmit: (feedbackText: string) => void;
};

/**
 * Write review notes and return a submitted assignment to the student. On
 * return the submission flips back to "unsubmitted" so the student can revise.
 */
export function ReturnFeedbackDialog({
  open,
  onOpenChange,
  studentName,
  submitting,
  onSubmit,
}: Props) {
  // Parent remounts this dialog per student (via `key`), so local state starts
  // fresh each time it opens — no reset effect needed.
  const [text, setText] = useState("");
  const canSubmit = text.trim().length > 0 && !submitting;

  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beri Feedback & Kembalikan</DialogTitle>
          <DialogDescription>
            Tulis catatan revisi untuk{" "}
            <span className="font-semibold text-foreground">{studentName ?? "peserta"}</span>.
            Tugas akan dikembalikan agar peserta dapat memperbaiki dan
            mengumpulkan ulang.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
          rows={5}
          maxLength={2000}
          placeholder="mis. Tolong perbaiki responsivitas di breakpoint mobile, lalu kumpulkan ulang."
          className="resize-none"
          autoFocus
        />

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit(text.trim())}
            className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <RotateCcw className="size-4" strokeWidth={2.4} />
            )}
            {submitting ? "Mengembalikan…" : "Kembalikan Tugas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
