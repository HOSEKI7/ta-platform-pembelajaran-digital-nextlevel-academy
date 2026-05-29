"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { SubmissionDropzone } from "@/components/internship/tasks/submission-dropzone";
import { useCreateTaskMutation } from "@/hooks/use-create-task";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validators/mentor-tasks";

import { DeadlinePicker } from "./deadline-picker";
import { TaskDescriptionEditor } from "./task-description-editor";

type Props = {
  classFullName: string;
  /** Selectable deadline bounds "yyyy-MM-dd" (today WIB … batch end). */
  minISO: string;
  maxISO: string;
};

export function CreateTaskView({ classFullName, minISO, maxISO }: Props) {
  const router = useRouter();
  const mutation = useCreateTaskMutation();

  const [file, setFile] = useState<File | null>(null);
  const [dateISO, setDateISO] = useState("");
  const [time, setTime] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: "", description: "", deadline: "" },
  });

  const isSubmitting = mutation.isPending;

  function syncDeadline(nextDate: string, nextTime: string) {
    setDateISO(nextDate);
    setTime(nextTime);
    setValue("deadline", nextDate && nextTime ? `${nextDate}T${nextTime}` : "", {
      shouldValidate: true,
    });
  }

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(
      { ...values, file },
      {
        onSuccess: () => {
          toast.success("Tugas berhasil dibuat.", {
            description: "Peserta di kelasmu kini dapat melihat tugas ini.",
          });
          router.push("/mentor/tasks");
          router.refresh();
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Gagal membuat tugas."),
      },
    );
  });

  return (
    <StudentPageContainer width="narrow">
      <Link
        href="/mentor/tasks"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:text-zinc-400 dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Kelola Tugas
      </Link>

      <PageHeader
        eyebrow="Mentor · Tugas"
        title="Buat Tugas"
        accent="Baru"
        description={`Tugas akan diberikan ke seluruh peserta di kelas bimbinganmu — ${classFullName}.`}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        {/* Judul */}
        <Field label="Judul Tugas" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            placeholder="mis. Implementasi Halaman Dashboard Responsif"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
        </Field>

        {/* Deskripsi (rich text) */}
        <Field
          label="Deskripsi Tugas"
          error={errors.description?.message}
          hint="Tulis instruksi selengkap mungkin. Bisa tempel 1 gambar pendukung."
        >
          <TaskDescriptionEditor
            disabled={isSubmitting}
            onChange={(html) =>
              setValue("description", html, { shouldValidate: true })
            }
          />
        </Field>

        {/* Lampiran (opsional) */}
        <Field
          label="Lampiran Pendukung"
          hint="Opsional · PDF, DOCX, atau ZIP · maksimal 5 MB"
        >
          <SubmissionDropzone file={file} onFileChange={setFile} disabled={isSubmitting} />
        </Field>

        {/* Tenggat */}
        <Field label="Batas Waktu Pengumpulan" error={errors.deadline?.message}>
          <DeadlinePicker
            dateISO={dateISO}
            time={time}
            minISO={minISO}
            maxISO={maxISO}
            disabled={isSubmitting}
            onDateChange={(d) => syncDeadline(d, time)}
            onTimeChange={(t) => syncDeadline(dateISO, t)}
          />
        </Field>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-5 dark:border-[color:var(--color-surface-border)]">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={isSubmitting}
            onClick={() => router.push("/mentor/tasks")}
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-[color:var(--color-brand-600)] px-5 text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <Send className="size-4" strokeWidth={2.4} />
            )}
            {isSubmitting ? "Menyimpan…" : "Buat Tugas"}
          </Button>
        </div>
      </form>
    </StudentPageContainer>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        {label}
      </Label>
      {hint ? (
        <p className="-mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
