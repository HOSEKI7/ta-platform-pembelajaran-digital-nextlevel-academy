"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatFileSize } from "./tasks-mock-data";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = [".pdf", ".docx", ".zip"] as const;
const ACCEPT_ATTR =
  ".pdf,.docx,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-zip-compressed";

type Props = {
  /** Currently selected file (controlled by the parent). */
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Lock interaction (e.g. while submitting or after deadline). */
  disabled?: boolean;
};

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function validate(file: File): string | null {
  if (!ALLOWED_EXT.includes(extOf(file.name) as (typeof ALLOWED_EXT)[number])) {
    return "Format tidak didukung. Gunakan PDF, DOCX, atau ZIP.";
  }
  if (file.size > MAX_BYTES) {
    return `Ukuran file ${formatFileSize(file.size)} melebihi batas 5 MB.`;
  }
  return null;
}

/**
 * Drag-and-drop file picker for task submission (PRD §6.9.3). Accepts a single
 * PDF/DOCX/ZIP up to 5 MB and validates type + size inline. UI-only: it surfaces
 * the chosen File to the parent; no upload happens here.
 */
export function SubmissionDropzone({ file, onFileChange, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function accept(next: File | undefined) {
    if (!next) return;
    const err = validate(next);
    if (err) {
      setError(err);
      onFileChange(null);
      return;
    }
    setError(null);
    onFileChange(next);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    accept(e.dataTransfer.files?.[0]);
  }

  function clear() {
    setError(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Selected-file preview state
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-brand-200)] bg-[color:var(--color-brand-50)]/60 p-4 dark:border-[color:var(--color-brand-400)]/40 dark:bg-[color:var(--color-brand-500)]/10">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-white/10 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
          <FileText className="size-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{file.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatFileSize(file.size)} · siap dikumpulkan
          </p>
        </div>
        {!disabled ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus file terpilih"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-white hover:text-red-600 dark:hover:bg-white/10"
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        ) : (
          <Loader2 className="size-5 shrink-0 animate-spin text-[color:var(--color-brand-600)]" strokeWidth={2.2} />
        )}
      </div>
    );
  }

  // Empty drop target
  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition outline-none",
          disabled
            ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]"
            : "cursor-pointer border-zinc-300 bg-zinc-50/60 hover:border-[color:var(--color-brand-400)] hover:bg-[color:var(--color-brand-50)]/50 focus-visible:border-[color:var(--color-brand-500)] dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02] dark:hover:border-[color:var(--color-brand-400)]/60 dark:hover:bg-white/[0.04]",
          isDragging &&
            !disabled &&
            "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)] dark:bg-[color:var(--color-brand-500)]/10",
        )}
      >
        <span
          className={cn(
            "grid size-12 place-items-center rounded-2xl transition",
            isDragging && !disabled
              ? "bg-[color:var(--color-brand-500)] text-white"
              : "bg-white text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-white/10 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
          )}
        >
          <UploadCloud className="size-6" strokeWidth={2.2} />
        </span>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {isDragging ? "Lepaskan file di sini" : "Tarik & letakkan file, atau klik untuk memilih"}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">PDF, DOCX, atau ZIP · maksimal 5 MB</p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          disabled={disabled}
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <X className="size-3.5" strokeWidth={2.6} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
