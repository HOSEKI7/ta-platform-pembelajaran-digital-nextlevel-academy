"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { MentorTaskEditData } from "@/lib/mentor-types";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { useUpdateTaskMutation } from "@/hooks/use-mentor-task-actions";

import { TaskForm } from "@/components/mentor/tasks/create/task-form";

type Props = {
  data: MentorTaskEditData;
  minISO: string;
  maxISO: string;
};

export function EditTaskView({ data, minISO, maxISO }: Props) {
  const router = useRouter();
  const { task, context } = data;
  const mutation = useUpdateTaskMutation(task.id);
  const detailHref = `/mentor/tasks/${task.id}`;

  return (
    <StudentPageContainer width="narrow">
      <Link
        href={detailHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:text-zinc-400 dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Detail Tugas
      </Link>

      <PageHeader
        eyebrow="Mentor · Tugas"
        title="Edit"
        accent="Tugas"
        description={`Perbarui detail tugas untuk kelas ${context.classFullName}.`}
      />

      <TaskForm
        mode="edit"
        classFullName={context.classFullName}
        minISO={minISO}
        maxISO={maxISO}
        submitting={mutation.isPending}
        submitLabel="Simpan Perubahan"
        submittingLabel="Menyimpan…"
        initial={{
          title: task.title,
          description: task.descriptionHtml,
          deadlineWib: task.deadlineWib,
          attachment: task.attachment,
        }}
        onCancel={() => router.push(detailHref)}
        onSubmit={({ values, file, attachmentAction, descriptionImage }) =>
          mutation.mutate(
            { ...values, file, attachmentAction, descriptionImage },
            {
              onSuccess: () => {
                toast.success("Perubahan tersimpan.");
                router.push(detailHref);
                router.refresh();
              },
              onError: (err) =>
                toast.error(
                  err instanceof Error ? err.message : "Gagal menyimpan perubahan.",
                ),
            },
          )
        }
      />
    </StudentPageContainer>
  );
}
