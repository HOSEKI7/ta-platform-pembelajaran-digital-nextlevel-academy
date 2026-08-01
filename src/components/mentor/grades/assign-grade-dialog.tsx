"use client";

import { useState } from "react";
import { Award, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sanitizeGradeInput } from "@/lib/validations/mentor-grade";
import type { MentorGradeRow } from "@/lib/mentor-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: MentorGradeRow;
  submitting: boolean;
  onSubmit: (payload: { grade: number; note: string | null }) => void;
};

/**
 * Assign or edit a mentee's final grade. The parent remounts this per row
 * (via `key`), so local state seeds from `row` on open — no reset effect needed.
 */
export function AssignGradeDialog({
  open,
  onOpenChange,
  row,
  submitting,
  onSubmit,
}: Props) {
  const isEdit = row.grade !== null;
  const [gradeText, setGradeText] = useState(
    row.grade !== null ? String(row.grade) : "",
  );
  const [note, setNote] = useState(row.note ?? "");

  const parsed = Number(gradeText);
  const gradeValid =
    gradeText.trim() !== "" &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= 100;
  const canSubmit = gradeValid && !submitting;

  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nilai Akhir</DialogTitle>
          <DialogDescription>
            Beri nilai akhir untuk{" "}
            <span className="font-semibold text-foreground">{row.name}</span>{" "}
            dalam rentang 0–100.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <label
              htmlFor="final-grade"
              className="text-sm font-medium text-foreground"
            >
              Nilai (0–100)
            </label>
            <Input
              id="final-grade"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={gradeText}
              onChange={(e) => setGradeText(sanitizeGradeInput(e.target.value))}
              disabled={submitting}
              placeholder="mis. 85"
              className="h-10 text-base"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="final-grade-note"
              className="text-sm font-medium text-foreground"
            >
              Catatan{" "}
              <span className="font-normal text-muted-foreground">
                (opsional)
              </span>
            </label>
            <Textarea
              id="final-grade-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={500}
              placeholder="mis. Performa konsisten, aktif di kelas dan tugas selesai tepat waktu."
              className="resize-none"
            />
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {note.length >= 500 ? (
                  <span className="font-medium text-rose-500">Mencapai batas maksimal 500 karakter</span>
                ) : (
                  <span>Terlihat oleh peserta magang</span>
                )}
              </span>
              <span
                className={cn(
                  "font-mono font-medium tabular-nums",
                  note.length >= 500
                    ? "font-bold text-rose-500"
                    : note.length >= 450
                      ? "text-amber-500"
                      : "text-muted-foreground",
                )}
              >
                {note.length}/500
              </span>
            </div>
          </div>
        </div>

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
            onClick={() =>
              onSubmit({ grade: parsed, note: note.trim() || null })
            }
            className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <Award className="size-4" strokeWidth={2.4} />
            )}
            {submitting
              ? "Menyimpan…"
              : isEdit
                ? "Perbarui Nilai"
                : "Simpan Nilai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
