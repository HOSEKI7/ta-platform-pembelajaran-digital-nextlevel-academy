"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import {
  useUpdateCourseMutation,
  useUpdateCourseStatusMutation,
} from "@/hooks/use-admin-course-form";
import type { AdminCategoryOption, CourseEditData } from "@/lib/admin-course-form-types";
import type { CourseGeneralInput } from "@/lib/validations/admin-course";

import { CourseGeneralForm, type CourseFormSubmit } from "./course-general-form";
import { CurriculumBuilder } from "./curriculum-builder";
import { CourseStatusBadge } from "../course-status-badge";

type Props = {
  data: CourseEditData;
  categories: AdminCategoryOption[];
};

export function CourseEditView({ data, categories }: Props) {
  const router = useRouter();
  const updateCourse = useUpdateCourseMutation(data.id);
  const updateStatus = useUpdateCourseStatusMutation(data.id);

  const initialValues: CourseGeneralInput = {
    title: data.title,
    slug: data.slug,
    shortDescription: data.shortDescription,
    description: data.description,
    categoryId: data.categoryId,
    price: data.price,
    fakePrice: data.fakePrice,
    instructor: data.instructor,
    instructorBio: data.instructorBio,
    isFeatured: data.isFeatured,
    status: data.status,
    benefits: data.benefits,
    faqs: data.faqs,
  };

  const busy = updateCourse.isPending || updateStatus.isPending;

  const handleSubmit = (payload: CourseFormSubmit) => {
    const nextStatus = payload.values.status;
    const statusChanged = nextStatus !== data.status;

    updateCourse.mutate(payload, {
      onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan."),
      onSuccess: () => {
        if (!statusChanged) {
          toast.success("Perubahan kursus disimpan.");
          router.refresh();
          return;
        }
        updateStatus.mutate(nextStatus, {
          onSuccess: () => {
            toast.success(
              nextStatus === "PUBLISHED"
                ? "Kursus dipublikasikan."
                : "Perubahan & status disimpan.",
            );
            router.refresh();
          },
          onError: (e) => {
            // General info was saved; only the status transition was rejected.
            toast.error(e instanceof Error ? e.message : "Status gagal diubah.");
            router.refresh();
          },
        });
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/courses"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="size-4" strokeWidth={2.4} />
          Kembali ke Daftar Kursus
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageHeader
            eyebrow="Admin · Manajemen Kursus"
            title="Sunting"
            accent="Kursus"
            description="Perbarui informasi, susun kurikulum, lalu publikasikan."
          />
          <div className="flex items-center gap-3">
            <CourseStatusBadge status={data.status} />
            {data.status === "PUBLISHED" ? (
              <Link
                href={`/courses/${data.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-brand-600)] transition hover:text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]"
              >
                <ExternalLink className="size-4" strokeWidth={2.2} />
                Lihat di katalog
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <CourseGeneralForm
        mode="edit"
        categories={categories}
        initial={{
          values: initialValues,
          thumbnailPreview: data.thumbnailUrl,
          instructorPreview: data.instructorImgUrl,
        }}
        middleSlot={<CurriculumBuilder courseId={data.id} sprints={data.sprints} />}
        submitting={busy}
        submitLabel={busy ? "Menyimpan…" : "Simpan Perubahan"}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/courses")}
      />
    </div>
  );
}
