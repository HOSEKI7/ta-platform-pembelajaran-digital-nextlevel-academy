"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { useCreateTaskMutation } from "@/hooks/use-create-task";

import { TaskForm } from "./task-form";

type Props = {
  classFullName: string;
  /** Selectable deadline bounds "yyyy-MM-dd" (today WIB … batch end). */
  minISO: string;
  maxISO: string;
};

export function CreateTaskView({ classFullName, minISO, maxISO }: Props) {
  const router = useRouter();
  const mutation = useCreateTaskMutation();

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

      <TaskForm
        mode="create"
        classFullName={classFullName}
        minISO={minISO}
        maxISO={maxISO}
        submitting={mutation.isPending}
        submitLabel="Buat Tugas"
        submittingLabel="Menyimpan…"
        onCancel={() => router.push("/mentor/tasks")}
        onSubmit={({ values, file }) =>
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
          )
        }
      />
    </StudentPageContainer>
  );
}
