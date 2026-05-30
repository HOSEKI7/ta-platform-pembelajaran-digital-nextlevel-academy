"use client";

import { useFormContext } from "react-hook-form";
import { SlidersHorizontal, UserRound } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COURSE_STATUSES,
  type CourseGeneralInput,
  type CourseStatusValue,
} from "@/lib/validations/admin-course";
import type { AdminCategoryOption } from "@/lib/admin-course-form-types";

import { Field } from "./field";
import { SectionCard } from "./section-card";
import { ImageUploader } from "./image-uploader";

const STATUS_LABEL: Record<CourseStatusValue, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_HINT: Record<CourseStatusValue, string> = {
  DRAFT: "Belum terlihat publik.",
  PUBLISHED: "Aktif & dapat diakses publik.",
  ARCHIVED: "Dinonaktifkan; akses peserta lama tetap.",
};

type Props = {
  mode: "create" | "edit";
  categories: AdminCategoryOption[];
  instructorPreview: string;
  onInstructorChange: (file: File | null) => void;
  disabled?: boolean;
};

export function CourseSettingsSection({
  mode,
  categories,
  instructorPreview,
  onInstructorChange,
  disabled,
}: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CourseGeneralInput>();

  const status = (watch("status") ?? "DRAFT") as CourseStatusValue;
  const categoryId = watch("categoryId");
  const categoryName = categories.find((c) => c.id === categoryId)?.name;

  return (
    <SectionCard
      icon={SlidersHorizontal}
      title="Pengaturan Kursus"
      description="Status publikasi, kategori, dan profil instruktur."
    >
      {/* Status */}
      <Field
        label="Status"
        error={errors.status?.message}
        hint={
          mode === "create"
            ? "Kursus baru selalu disimpan sebagai Draft. Publikasikan setelah kurikulum lengkap."
            : STATUS_HINT[status]
        }
      >
        <Select
          value={status}
          onValueChange={(v) => {
            if (typeof v === "string") setValue("status", v as CourseStatusValue);
          }}
          disabled={disabled || mode === "create"}
        >
          <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Status kursus">
            <SelectValue>
              {(v: string) => STATUS_LABEL[(v as CourseStatusValue) ?? "DRAFT"] ?? "Draft"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COURSE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {mode === "edit" && status === "PUBLISHED" ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Mengubah ke Published menjalankan validasi kelengkapan kursus saat disimpan.
          </p>
        ) : null}
      </Field>

      {/* Kategori */}
      <Field label="Kategori" error={errors.categoryId?.message}>
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/[0.07] dark:text-amber-300">
            Belum ada kategori. Buat kategori terlebih dahulu di Manajemen Kategori.
          </p>
        ) : (
          <Select
            value={categoryId || ""}
            onValueChange={(v) => {
              if (typeof v === "string") setValue("categoryId", v, { shouldValidate: true });
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Kategori kursus">
              <SelectValue placeholder="Pilih kategori…">
                {() => categoryName ?? "Pilih kategori…"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>

      {/* Instruktur */}
      <div className="rounded-2xl border border-zinc-200 p-4 dark:border-[color:var(--color-surface-border)]">
        <div className="mb-4 flex items-center gap-2 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]">
          <UserRound className="size-4" strokeWidth={2.2} />
          <span className="text-xs font-semibold uppercase tracking-wide">Instruktur</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="w-32">
            <ImageUploader
              previewUrl={instructorPreview}
              onFileChange={onInstructorChange}
              shape="square"
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Nama Instruktur" htmlFor="instructor" error={errors.instructor?.message}>
              <Input
                id="instructor"
                placeholder="mis. Budi Santoso"
                className="h-11 rounded-xl"
                disabled={disabled}
                {...register("instructor")}
              />
            </Field>
            <Field label="Bio Instruktur" htmlFor="instructorBio" error={errors.instructorBio?.message}>
              <Textarea
                id="instructorBio"
                placeholder="Pengalaman & keahlian singkat instruktur."
                rows={3}
                className="rounded-xl"
                disabled={disabled}
                {...register("instructorBio")}
              />
            </Field>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
