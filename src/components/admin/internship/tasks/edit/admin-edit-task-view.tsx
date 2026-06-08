"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { AdminTaskEditData } from "@/lib/admin-internship-tasks-loader";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { TaskForm } from "@/components/mentor/tasks/create/task-form";
import { useAdminUpdateTaskMutation } from "@/hooks/use-admin-tasks";

type Props = {
  data: AdminTaskEditData;
  minISO: string;
  maxISO: string;
};

export function AdminEditTaskView({ data, minISO, maxISO }: Props) {
  const router = useRouter();
  const { task, classLabel } = data;
  const mutation = useAdminUpdateTaskMutation(task.id);
  const detailHref = `/admin/internship/tasks/${task.id}`;

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
        eyebrow="Admin · Tugas"
        title="Edit"
        accent="Tugas"
        description={`Perbarui detail tugas untuk kelas ${classLabel}.`}
      />

      <TaskForm
        mode="edit"
        classFullName={classLabel}
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
