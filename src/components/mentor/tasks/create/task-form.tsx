"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, RefreshCw, Send, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmissionDropzone } from "@/components/internship/tasks/submission-dropzone";
import { CharCounter } from "@/components/ui/char-counter";
import {
  createTaskSchema,
  DEADLINE_PATTERN,
  type CreateTaskInput,
} from "@/lib/validators/mentor-tasks";

import dynamic from "next/dynamic";

import { DeadlinePicker } from "./deadline-picker";

const TaskDescriptionEditor = dynamic(
  () => import("./task-description-editor").then((mod) => mod.TaskDescriptionEditor),
  { ssr: false },
);

export type AttachmentAction = "keep" | "remove" | "replace";

export type TaskFormInitial = {
  title: string;
  description: string;
  /** Wall-clock WIB "yyyy-MM-ddTHH:mm" ("" when none). */
  deadlineWib: string;
  attachment: { name: string; sizeLabel: string } | null;
};

export type TaskFormSubmit = {
  values: CreateTaskInput;
  file: File | null;
  attachmentAction: AttachmentAction;
  /** Newly attached description image (uploaded server-side on save). */
  descriptionImage: File | null;
};

type Props = {
  mode: "create" | "edit";
  classFullName: string;
  minISO: string;
  maxISO: string;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  initial?: TaskFormInitial;
  onSubmit: (payload: TaskFormSubmit) => void;
  onCancel: () => void;
};

function splitDeadline(wib: string): { date: string; time: string } {
  if (DEADLINE_PATTERN.test(wib)) {
    const [date, time] = wib.split("T");
    return { date, time };
  }
  return { date: "", time: "" };
}

/**
 * Shared task form for both create and edit. Owns the form/editor/attachment/
 * deadline state and emits a normalized payload via `onSubmit`; the parent view
 * wires the mutation, redirect, and surrounding page chrome.
 */
export function TaskForm({
  mode,
  classFullName,
  minISO,
  maxISO,
  submitting,
  submitLabel,
  submittingLabel,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const initialDeadline = splitDeadline(initial?.deadlineWib ?? "");
  const hasExisting = Boolean(initial?.attachment);

  const [file, setFile] = useState<File | null>(null);
  const [descriptionImage, setDescriptionImage] = useState<File | null>(null);
  const [dateISO, setDateISO] = useState(initialDeadline.date);
  const [time, setTime] = useState(initialDeadline.time);
  const [attachmentAction, setAttachmentAction] =
    useState<AttachmentAction>("keep");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      deadline: DEADLINE_PATTERN.test(initial?.deadlineWib ?? "")
        ? (initial?.deadlineWib ?? "")
        : "",
    },
  });

  function syncDeadline(nextDate: string, nextTime: string) {
    setDateISO(nextDate);
    setTime(nextTime);
    setValue("deadline", nextDate && nextTime ? `${nextDate}T${nextTime}` : "", {
      shouldValidate: true,
    });
  }

  const submit = handleSubmit((values) => {
    let action = attachmentAction;
    if (action === "replace" && !file) action = "keep";
    onSubmit({ values, file, attachmentAction: action, descriptionImage });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      {/* Judul */}
      <Field
        label="Judul Tugas"
        htmlFor="title"
        current={(watch("title") ?? "").length}
        max={150}
        error={errors.title?.message}
      >
        <Input
          id="title"
          placeholder="mis. Implementasi Halaman Dashboard Responsif"
          maxLength={150}
          className="h-11 rounded-xl"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
      </Field>

      {/* Deskripsi */}
      <Field
        label="Deskripsi Tugas"
        error={errors.description?.message}
        hint="Tulis instruksi selengkap mungkin (maks. 5000 karakter, 1 gambar maks 2 MB)."
      >
        <TaskDescriptionEditor
          initialHTML={initial?.description}
          disabled={submitting}
          onPendingImageChange={setDescriptionImage}
          onChange={(html) => setValue("description", html, { shouldValidate: true })}
        />
      </Field>

      {/* Lampiran */}
      <Field label="Lampiran Pendukung" hint="Opsional · PDF, DOCX, atau ZIP · maksimal 5 MB">
        {hasExisting && attachmentAction === "keep" && initial?.attachment ? (
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              <FileText className="size-5" strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {initial.attachment.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {initial.attachment.sizeLabel} · lampiran saat ini
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submitting}
              onClick={() => {
                setAttachmentAction("replace");
                setFile(null);
              }}
            >
              <RefreshCw className="size-3.5" strokeWidth={2.4} />
              Ganti
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submitting}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              onClick={() => {
                setAttachmentAction("remove");
                setFile(null);
              }}
            >
              <Trash2 className="size-3.5" strokeWidth={2.4} />
              Hapus
            </Button>
          </div>
        ) : attachmentAction === "remove" ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/[0.07]">
            <span className="inline-flex items-center gap-2 font-medium text-red-700 dark:text-red-300">
              <X className="size-4" strokeWidth={2.4} />
              Lampiran akan dihapus saat disimpan.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submitting}
              onClick={() => setAttachmentAction("keep")}
            >
              Urungkan
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <SubmissionDropzone
              file={file}
              onFileChange={(f) => {
                setFile(f);
                if (mode === "edit" && f) setAttachmentAction("replace");
              }}
              disabled={submitting}
            />
            {hasExisting ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setAttachmentAction("keep");
                  setFile(null);
                }}
                className="w-fit text-xs font-semibold text-zinc-500 underline-offset-2 transition hover:text-zinc-800 hover:underline disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Pertahankan lampiran lama
              </button>
            ) : null}
          </div>
        )}
      </Field>

      {/* Tenggat */}
      <Field label="Batas Waktu Pengumpulan" error={errors.deadline?.message}>
        <DeadlinePicker
          dateISO={dateISO}
          time={time}
          minISO={minISO}
          maxISO={maxISO}
          disabled={submitting}
          onDateChange={(d) => syncDeadline(d, time)}
          onTimeChange={(t) => syncDeadline(dateISO, t)}
        />
      </Field>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Tugas untuk kelas <span className="font-medium">{classFullName}</span>.
      </p>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-5 dark:border-[color:var(--color-surface-border)]">
        <Button type="button" variant="ghost" size="lg" disabled={submitting} onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="bg-[color:var(--color-brand-600)] px-5 text-white hover:bg-[color:var(--color-brand-700)]"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
          ) : (
            <Send className="size-4" strokeWidth={2.4} />
          )}
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  current,
  max,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  current?: number;
  max?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {label}
        </Label>
        {max !== undefined && current !== undefined ? (
          <CharCounter current={current} max={max} />
        ) : null}
      </div>
      {hint ? <p className="-mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      {children}
      {error ? (
        <p className={cn("text-xs font-medium text-red-600 dark:text-red-400")}>{error}</p>
      ) : null}
    </div>
  );
}
