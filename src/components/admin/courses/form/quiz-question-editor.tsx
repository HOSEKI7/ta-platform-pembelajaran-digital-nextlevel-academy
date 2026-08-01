"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Circle, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CharCounter } from "@/components/ui/char-counter";

export type QuizQuestionDraft = {
  /** Local React key only — not persisted. */
  key: string;
  question: string;
  /** Stored Bunny object path (persisted), null when no image. */
  imagePath: string | null;
  /** Signed URL for preview. */
  imageUrl: string | null;
  options: string[];
  answer: number;
};

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

type Props = {
  index: number;
  value: QuizQuestionDraft;
  onChange: (next: QuizQuestionDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
};

export function QuizQuestionEditor({ index, value, onChange, onRemove, canRemove, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const patch = (partial: Partial<QuizQuestionDraft>) => onChange({ ...value, ...partial });

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/quiz/images", { method: "POST", body: fd });
      const body = (await res.json().catch(() => null)) as
        | { data?: { path: string; url: string }; error?: string }
        | null;
      if (!res.ok || !body?.data) throw new Error(body?.error ?? "Gagal mengunggah gambar.");
      patch({ imagePath: body.data.path, imageUrl: body.data.url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  }

  const setOption = (i: number, text: string) => {
    const options = value.options.slice();
    options[i] = text;
    patch({ options });
  };

  const addOption = () => patch({ options: [...value.options, ""] });

  const removeOption = (i: number) => {
    if (value.options.length <= 2) return;
    const options = value.options.filter((_, idx) => idx !== i);
    const answer = value.answer === i ? 0 : value.answer > i ? value.answer - 1 : value.answer;
    patch({ options, answer });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100">
          <span className="grid size-6 place-items-center rounded-md bg-[color:var(--color-brand-500)] text-[11px] font-bold text-white">
            {index + 1}
          </span>
          Soal
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !canRemove}
          onClick={onRemove}
          className="text-zinc-400 hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400"
        >
          <Trash2 className="size-3.5" strokeWidth={2.4} />
          Hapus soal
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <Textarea
          value={value.question}
          onChange={(e) => patch({ question: e.target.value })}
          placeholder="Tulis pertanyaan… (boleh dikosongkan jika memakai gambar)"
          rows={2}
          maxLength={2000}
          className="rounded-xl"
          disabled={disabled}
        />
        <div className="flex justify-end">
          <CharCounter current={value.question.length} max={2000} />
        </div>
      </div>

      {/* Optional image */}
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadImage(f);
          e.target.value = "";
        }}
      />
      {value.imageUrl ? (
        <div className="relative w-fit overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-[color:var(--color-surface-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.imageUrl} alt="Gambar soal" className="max-h-40 object-contain" />
          <button
            type="button"
            disabled={disabled}
            onClick={() => patch({ imagePath: null, imageUrl: null })}
            className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            aria-label="Hapus gambar"
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          className="w-fit rounded-full"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
          ) : (
            <ImagePlus className="size-3.5" strokeWidth={2.4} />
          )}
          {uploading ? "Mengunggah…" : "Tambah gambar (opsional)"}
        </Button>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Opsi Jawaban · klik lingkaran untuk menandai yang benar
        </p>
        {value.options.map((opt, i) => {
          const correct = value.answer === i;
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => patch({ answer: i })}
                aria-label={correct ? "Jawaban benar" : "Tandai sebagai benar"}
                className={cn(
                  "shrink-0 transition",
                  correct
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-300 hover:text-zinc-500 dark:text-zinc-600",
                )}
              >
                {correct ? (
                  <CheckCircle2 className="size-5" strokeWidth={2.2} />
                ) : (
                  <Circle className="size-5" strokeWidth={2.2} />
                )}
              </button>
              <div className="relative flex-1">
                <Input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Opsi ${i + 1}`}
                  maxLength={500}
                  className={cn(
                    "h-10 rounded-xl pr-16",
                    correct && "border-emerald-300 dark:border-emerald-500/40",
                  )}
                  disabled={disabled}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CharCounter current={opt.length} max={500} showWarningLabel={false} />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || value.options.length <= 2}
                onClick={() => removeOption(i)}
                aria-label="Hapus opsi"
                className="shrink-0 text-zinc-400 hover:text-red-600 disabled:opacity-30 dark:hover:text-red-400"
              >
                <X className="size-4" strokeWidth={2.4} />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addOption}
          className="w-fit rounded-full"
        >
          <Plus className="size-3.5" strokeWidth={2.6} />
          Tambah Opsi
        </Button>
      </div>
    </div>
  );
}
