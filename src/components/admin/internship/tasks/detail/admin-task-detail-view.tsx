"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type {
  AdminSubmissionRow,
  AdminTaskDetail,
} from "@/lib/admin-internship-tasks-query";
import { Button } from "@/components/ui/button";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { RichTextContent } from "@/components/internship/tasks/rich-text-content";
import { DeleteTaskDialog } from "@/components/mentor/tasks/detail/delete-task-dialog";
import {
  useAdminDeleteTaskMutation,
  useAdminSetSubmissionStatusMutation,
} from "@/hooks/use-admin-tasks";

import { AdminSubmissionsTable } from "./admin-submissions-table";
import { ForceStatusDialog } from "./force-status-dialog";

const WIB_TZ = "Asia/Jakarta";

type Props = {
  data: AdminTaskDetail;
};

export function AdminTaskDetailView({ data }: Props) {
  const router = useRouter();
  const { task, rows, summary } = data;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [forceTarget, setForceTarget] = useState<AdminSubmissionRow | null>(null);

  const deleteMutation = useAdminDeleteTaskMutation();
  const forceMutation = useAdminSetSubmissionStatusMutation(task.id);

  const deadlineLong = formatInTimeZone(
    new Date(task.deadlineISO),
    WIB_TZ,
    "EEEE, dd MMMM yyyy · HH:mm",
    { locale: idLocale },
  );

  function handleDelete() {
    deleteMutation.mutate(task.id, {
      onSuccess: () => {
        toast.success("Tugas dihapus.");
        router.push("/admin/internship/tasks");
        router.refresh();
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal menghapus tugas."),
    });
  }

  function handleForce() {
    if (!forceTarget) return;
    const next = forceTarget.rawStatus === "SUBMITTED" ? "NOT_SUBMITTED" : "SUBMITTED";
    forceMutation.mutate(
      { studentId: forceTarget.studentId, status: next },
      {
        onSuccess: () => {
          toast.success(
            next === "SUBMITTED"
              ? `${forceTarget.name} ditandai sudah mengumpulkan.`
              : `${forceTarget.name} ditandai belum mengumpulkan.`,
          );
          setForceTarget(null);
          router.refresh();
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal mengubah status pengumpulan.",
          ),
      },
    );
  }

  return (
    <StudentPageContainer>
      <Link
        href="/admin/internship/tasks"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:text-zinc-400 dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Kelola Tugas
      </Link>

      {/* Hero: title + meta + edit/delete */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(71,142,244,0.10) 0%, transparent 42%)",
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
              Admin · Detail Tugas
            </span>
            <h1 className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-4 text-zinc-400" strokeWidth={2} />
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {task.classLabel}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4 text-zinc-400" strokeWidth={2} />
                Tenggat{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {deadlineLong} WIB
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" strokeWidth={2} />
                <span className="font-semibold text-zinc-800 dark:text-zinc-100 tabular-nums">
                  {summary.terkumpul}/{summary.total}
                </span>{" "}
                terkumpul
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href={`/admin/internship/tasks/${task.id}/edit`} />}
            >
              <Pencil className="size-4" strokeWidth={2.4} />
              Edit
            </Button>
            <Button variant="destructive" size="lg" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" strokeWidth={2.4} />
              Hapus
            </Button>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-7 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Instruksi Tugas
        </h2>
        <RichTextContent
          html={task.descriptionHtml}
          className="mt-3 text-zinc-600 dark:text-zinc-300"
        />

        {task.attachment ? (
          <div className="mt-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              <Paperclip className="size-3.5" strokeWidth={2.2} />
              Lampiran
            </p>
            {task.attachment.url ? (
              <a
                href={task.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-2 flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 text-left transition hover:border-[color:var(--color-brand-200)] hover:bg-[color:var(--color-brand-50)]/40 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02] dark:hover:border-[color:var(--color-brand-400)]/40 dark:hover:bg-white/[0.04]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  <FileText className="size-5" strokeWidth={2.1} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {task.attachment.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {task.attachment.sizeLabel}
                  </p>
                </div>
                <Download
                  className="size-4 shrink-0 text-zinc-400 transition group-hover:text-[color:var(--color-brand-600)]"
                  strokeWidth={2.2}
                />
              </a>
            ) : (
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 opacity-70 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                  <FileText className="size-5" strokeWidth={2.1} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {task.attachment.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tautan unduh belum tersedia
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <AdminSubmissionsTable rows={rows} onForce={(row) => setForceTarget(row)} />

      <DeleteTaskDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        taskTitle={task.title}
        deleting={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
      {forceTarget ? (
        <ForceStatusDialog
          open
          onOpenChange={(o) => {
            if (!o && !forceMutation.isPending) setForceTarget(null);
          }}
          name={forceTarget.name}
          target={forceTarget.rawStatus === "SUBMITTED" ? "NOT_SUBMITTED" : "SUBMITTED"}
          hasFile={Boolean(forceTarget.file)}
          processing={forceMutation.isPending}
          onConfirm={handleForce}
        />
      ) : null}
    </StudentPageContainer>
  );
}
