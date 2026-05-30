"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useCreateCourseMutation } from "@/hooks/use-admin-course-form";
import type { AdminCategoryOption } from "@/lib/admin-course-form-types";

import { CourseGeneralForm, type CourseFormSubmit } from "./course-general-form";

type Props = { categories: AdminCategoryOption[] };

export function CreateCourseView({ categories }: Props) {
  const router = useRouter();
  const createMutation = useCreateCourseMutation();
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = (payload: CourseFormSubmit) => {
    createMutation.mutate(payload, {
      onSuccess: ({ id }) => {
        setRedirecting(true);
        toast.success("Draf kursus dibuat. Lanjutkan menyusun kurikulum.");
        router.push(`/admin/courses/${id}/edit`);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal membuat kursus."),
    });
  };

  const busy = createMutation.isPending || redirecting;

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
        <PageHeader
          eyebrow="Admin · Manajemen Kursus"
          title="Tambah"
          accent="Kursus"
          description="Mulai dengan informasi umum. Setelah disimpan sebagai draf, Anda dapat menyusun kurikulum (sprint & tahap)."
        />
      </div>

      <CourseGeneralForm
        mode="create"
        categories={categories}
        submitting={busy}
        submitLabel={busy ? "Menyimpan…" : "Simpan & Lanjutkan"}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/courses")}
      />
    </div>
  );
}
