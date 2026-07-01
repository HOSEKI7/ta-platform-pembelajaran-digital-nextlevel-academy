"use client";

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/courses/form/confirm-dialog";
import { courseEditSchema, type CourseGeneralInput } from "@/lib/validations/admin-course";
import type { AdminCategoryOption } from "@/lib/admin-course-form-types";

import { CourseGeneralSection } from "./course-general-section";
import { CourseSettingsSection } from "./course-settings-section";

export type CourseFormSubmit = {
  values: CourseGeneralInput;
  thumbnailFile: File | null;
  instructorFile: File | null;
};

export type CourseFormInitial = {
  values: CourseGeneralInput;
  thumbnailPreview: string;
  instructorPreview: string;
};

const EMPTY: CourseGeneralInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  price: 0,
  fakePrice: null,
  instructor: "",
  instructorBio: "",
  isFeatured: false,
  status: "DRAFT",
  benefits: [],
  faqs: [],
};

type Props = {
  mode: "create" | "edit";
  categories: AdminCategoryOption[];
  initial?: CourseFormInitial;
  /** Rendered between the General and Settings sections (e.g. the curriculum). */
  middleSlot?: React.ReactNode;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (payload: CourseFormSubmit) => void;
  onCancel: () => void;
};

export function CourseGeneralForm({
  mode,
  categories,
  initial,
  middleSlot,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<CourseGeneralInput>({
    // ponytail: always use courseEditSchema — create mode auto-derives slug from
    // title via useEffect before any submit, so validation always succeeds.
    resolver: zodResolver(courseEditSchema),
    defaultValues: initial?.values ?? EMPTY,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [instructorFile, setInstructorFile] = useState<File | null>(null);

  // Slug-change confirmation dialog (edit mode only).
  const [showSlugConfirm, setShowSlugConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<CourseFormSubmit | null>(null);

  const submit = form.handleSubmit(
    useCallback(
      (values: CourseGeneralInput) => {
        if (
          mode === "edit" &&
          initial &&
          values.slug !== initial.values.slug
        ) {
          setPendingSubmit({ values, thumbnailFile, instructorFile });
          setShowSlugConfirm(true);
          return;
        }
        onSubmit({ values, thumbnailFile, instructorFile });
      },
      [mode, initial, thumbnailFile, instructorFile, onSubmit],
    ),
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        <CourseGeneralSection
          mode={mode}
          initialDescription={initial?.values.description ?? ""}
          thumbnailPreview={initial?.thumbnailPreview ?? ""}
          onThumbnailChange={setThumbnailFile}
          slugLocked={mode === "edit"}
          initialSlug={initial?.values.slug}
          disabled={submitting}
        />

        {middleSlot}

        <CourseSettingsSection
          mode={mode}
          categories={categories}
          instructorPreview={initial?.instructorPreview ?? ""}
          onInstructorChange={setInstructorFile}
          disabled={submitting}
        />

        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-lg shadow-zinc-900/5 backdrop-blur dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]/90">
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
              <Save className="size-4" strokeWidth={2.4} />
            )}
            {submitLabel}
          </Button>
        </div>

        <ConfirmDialog
          open={showSlugConfirm}
          onOpenChange={setShowSlugConfirm}
          title="Ubah Slug URL?"
          description={
            <span>
              Slug URL akan diubah. Pengunjung yang masih menggunakan URL lama
              akan otomatis diarahkan ke URL baru ini. Slug lama akan dicatat
              sebagai riwayat.
            </span>
          }
          confirmLabel="Ya, Ubah Slug"
          busy={submitting}
          onConfirm={() => {
            setShowSlugConfirm(false);
            if (pendingSubmit) onSubmit(pendingSubmit);
          }}
        />
      </form>
    </FormProvider>
  );
}
