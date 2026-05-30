"use client";

import { useState } from "react";
import { ListChecks, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StepQuizPayload } from "@/hooks/use-admin-curriculum";

import { Field } from "./field";
import { RichTextEditor } from "./rich-text-editor";
import { QuizQuestionEditor, type QuizQuestionDraft } from "./quiz-question-editor";

export type QuizStepInitial = {
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestionDraft[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: QuizStepInitial;
  saving: boolean;
  onSave: (payload: Omit<StepQuizPayload, "type">) => void;
};

function newQuestion(): QuizQuestionDraft {
  return {
    key: typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    question: "",
    imagePath: null,
    imageUrl: null,
    options: ["", ""],
    answer: 0,
  };
}

export function QuizStepDialog({ open, onOpenChange, mode, initial, saving, onSave }: Props) {
  // State seeds from `initial` on mount; the parent remounts this dialog (via a
  // changing `key`) each time it opens, so there's no effect-based re-seed.
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [passingScore, setPassingScore] = useState(initial?.passingScore ?? 80);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>(
    initial?.questions?.length ? initial.questions : [newQuestion()],
  );

  const updateQuestion = (i: number, next: QuizQuestionDraft) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? next : q)));

  const removeQuestion = (i: number) =>
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  function handleSave() {
    if (title.trim().length < 2) {
      toast.error("Judul quiz minimal 2 karakter.");
      return;
    }
    for (const [i, q] of questions.entries()) {
      const opts = q.options.map((o) => o.trim());
      if (opts.some((o) => o.length === 0)) {
        toast.error(`Soal ${i + 1}: semua opsi harus diisi.`);
        return;
      }
      if (opts.length < 2) {
        toast.error(`Soal ${i + 1}: minimal 2 opsi.`);
        return;
      }
      if (q.question.trim().length === 0 && !q.imagePath) {
        toast.error(`Soal ${i + 1}: isi pertanyaan teks atau tambahkan gambar.`);
        return;
      }
      if (q.answer < 0 || q.answer >= opts.length) {
        toast.error(`Soal ${i + 1}: tandai satu jawaban benar.`);
        return;
      }
    }

    onSave({
      title: title.trim(),
      description,
      passingScore,
      questions: questions.map((q) => ({
        question: q.question.trim(),
        questionImageUrl: q.imagePath,
        options: q.options.map((o) => o.trim()),
        answer: q.answer,
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30">
            <ListChecks className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>{mode === "create" ? "Tambah Tahap Quiz" : "Edit Tahap Quiz"}</DialogTitle>
          <DialogDescription>
            Susun soal pilihan ganda. Tiap soal minimal 2 opsi dengan satu jawaban benar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
          <Field label="Judul Quiz" htmlFor="quiz-title">
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Kuis Dasar React"
              className="h-11 rounded-xl"
              disabled={saving}
            />
          </Field>

          <Field label="Deskripsi Materi" optional hint="Catatan singkat sebelum mengerjakan (teks).">
            <RichTextEditor
              compact
              initialHTML={initial?.description}
              disabled={saving}
              placeholder="Instruksi singkat quiz…"
              onChange={setDescription}
            />
          </Field>

          <Field label="Nilai Minimum Lulus" htmlFor="passing-score" hint="0–100 (default 80).">
            <Input
              id="passing-score"
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="h-11 w-28 rounded-xl"
              disabled={saving}
            />
          </Field>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              Daftar Soal ({questions.length})
            </p>
            {questions.map((q, i) => (
              <QuizQuestionEditor
                key={q.key}
                index={i}
                value={q}
                onChange={(next) => updateQuestion(i, next)}
                onRemove={() => removeQuestion(i)}
                canRemove={questions.length > 1}
                disabled={saving}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setQuestions((qs) => [...qs, newQuestion()])}
              className="w-fit rounded-full"
            >
              <Plus className="size-4" strokeWidth={2.6} />
              Tambah Soal
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" disabled={saving} onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : null}
            {saving ? "Menyimpan…" : "Simpan Tahap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
