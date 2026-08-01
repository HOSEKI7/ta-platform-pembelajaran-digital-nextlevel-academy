"use client";

import { useState } from "react";
import { Award, Loader2, Lock, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import type { AdminGradeRow } from "@/lib/admin-internship-grades-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: AdminGradeRow;
  submitting: boolean;
  onSubmit: (payload: {
    grade: number;
    note: string | null;
    reason: string;
    lockGrade: boolean;
  }) => void;
};

/**
 * Admin override of an intern's final grade. The parent remounts this per row
 * (via `key`), so local state seeds from `row` on open — no reset effect needed.
 * Unlike the mentor dialog, the administrative `reason` field is MANDATORY and
 * the copy frames the action as an emergency correction (PRD §6.11.9).
 */
export function AdminGradeDialog({
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
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  // Default to true as per spec — admin overrides default to locking
  const [lockGrade, setLockGrade] = useState(true);

  const parsed = Number(gradeText);
  const gradeValid =
    gradeText.trim() !== "" &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= 100;
  const reasonValid = reason.trim().length > 0;
  const canSubmit = gradeValid && reasonValid && !submitting;

  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Nilai Akhir (Admin)</DialogTitle>
          <DialogDescription>
            Tindakan administratif untuk{" "}
            <span className="font-semibold text-foreground">{row.name}</span>.
            Nilai mentor penanggung jawab tetap tercatat — Anda dicatat sebagai
            pengubah dan wajib menyertakan alasan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-grade"
              className="text-sm font-medium text-foreground"
            >
              Nilai (0–100)
            </label>
            <Input
              id="admin-grade"
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
              htmlFor="admin-grade-note"
              className="text-sm font-medium text-foreground"
            >
              Catatan nilai{" "}
              <span className="font-normal text-muted-foreground">
                (opsional, terlihat peserta)
              </span>
            </label>
            <Textarea
              id="admin-grade-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              rows={2}
              maxLength={500}
              placeholder="mis. Penyesuaian setelah verifikasi ulang berkas."
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="admin-grade-reason"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <ShieldAlert className="size-3.5 text-amber-500" strokeWidth={2.4} />
              Alasan perubahan{" "}
              <span className="font-normal text-[color:var(--color-error)]">
                (wajib)
              </span>
            </label>
            <Textarea
              id="admin-grade-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={500}
              placeholder="mis. Mentor berhalangan; nilai diinput berdasarkan rekap performa peserta."
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Alasan dicatat di log audit dan dikirim ke mentor penanggung jawab.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="admin-lock-grade"
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
              >
                <Lock className="size-4 text-amber-500" strokeWidth={2.2} />
                Kunci Nilai Ini
              </label>
              <Switch
                id="admin-lock-grade"
                checked={lockGrade}
                onCheckedChange={(c) => setLockGrade(Boolean(c))}
                disabled={submitting}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Jika aktif, mentor tidak dapat lagi mengedit nilai akhir peserta ini.
            </p>
            {row.isLocked && (
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Saat ini nilai peserta ini berstatus terkunci.
              </p>
            )}
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
              onSubmit({
                grade: parsed,
                note: note.trim() || null,
                reason: reason.trim(),
                lockGrade,
              })
            }
            className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <Award className="size-4" strokeWidth={2.4} />
            )}
            {submitting ? "Menyimpan…" : isEdit ? "Perbarui Nilai" : "Simpan Nilai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
