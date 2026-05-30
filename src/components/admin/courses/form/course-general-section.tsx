"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BookOpen, HelpCircle, ListChecks, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/slugify";
import type { CourseGeneralInput } from "@/lib/validations/admin-course";

import { Field } from "./field";
import { SectionCard } from "./section-card";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUploader } from "./image-uploader";
import { BenefitListField } from "./benefit-list-field";
import { FaqListField } from "./faq-list-field";

type Props = {
  initialDescription: string;
  thumbnailPreview: string;
  onThumbnailChange: (file: File | null) => void;
  /** True in edit mode so the slug isn't auto-overwritten from the title. */
  slugLocked: boolean;
  disabled?: boolean;
};

function formatIDR(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

export function CourseGeneralSection({
  initialDescription,
  thumbnailPreview,
  onThumbnailChange,
  slugLocked,
  disabled,
}: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CourseGeneralInput>();

  const [slugTouched, setSlugTouched] = useState(slugLocked);
  const title = watch("title");
  const price = watch("price");
  const fakePrice = watch("fakePrice");
  const isFeatured = watch("isFeatured");

  // Auto-derive the slug from the title until the admin edits it manually.
  // `shouldValidate` is false so an empty initial title doesn't surface a slug
  // error before the admin has typed anything (validation still runs on submit).
  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(title ?? ""), { shouldValidate: title.trim().length > 0 });
    }
  }, [title, slugTouched, setValue]);

  return (
    <SectionCard
      icon={BookOpen}
      title="Informasi Umum"
      description="Identitas kursus yang tampil di katalog."
    >
      <Field label="Judul Kursus" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="mis. Fullstack Web Development dengan Next.js"
          className="h-11 rounded-xl"
          aria-invalid={Boolean(errors.title)}
          disabled={disabled}
          {...register("title")}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Otomatis dari judul. Bisa diubah — hanya huruf kecil, angka, dan tanda hubung."
        error={errors.slug?.message}
      >
        <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-zinc-200 focus-within:border-[color:var(--color-brand-400)] dark:border-[color:var(--color-surface-border)]">
          <span className="select-none border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-400 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.03]">
            /courses/
          </span>
          <input
            id="slug"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none disabled:opacity-60"
            placeholder="fullstack-web-development"
            disabled={disabled}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
        </div>
      </Field>

      <Field
        label="Deskripsi Singkat"
        htmlFor="shortDescription"
        optional
        hint="Tampil di kartu katalog (maks. 280 karakter)."
        error={errors.shortDescription?.message}
      >
        <Textarea
          id="shortDescription"
          placeholder="Ringkasan satu-dua kalimat tentang kursus ini."
          rows={2}
          maxLength={280}
          className="rounded-xl"
          disabled={disabled}
          {...register("shortDescription")}
        />
      </Field>

      <Field
        label="Deskripsi Lengkap"
        hint="Tentang kursus — boleh format teks (tebal, daftar, kutipan)."
        error={errors.description?.message}
      >
        <RichTextEditor
          initialHTML={initialDescription}
          disabled={disabled}
          placeholder="Jelaskan apa yang dipelajari, untuk siapa, dan hasil akhirnya…"
          onChange={(html) => setValue("description", html, { shouldValidate: true })}
        />
      </Field>

      <Field label="Thumbnail" hint="Rasio 16:9 disarankan · PNG, JPG, WEBP · maks 5 MB">
        <ImageUploader
          previewUrl={thumbnailPreview}
          onFileChange={onThumbnailChange}
          shape="wide"
          disabled={disabled}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Harga (IDR)" htmlFor="price" error={errors.price?.message}>
          <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-zinc-200 focus-within:border-[color:var(--color-brand-400)] dark:border-[color:var(--color-surface-border)]">
            <span className="select-none border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.03]">
              Rp
            </span>
            <input
              id="price"
              inputMode="numeric"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm tabular-nums outline-none disabled:opacity-60"
              placeholder="0"
              disabled={disabled}
              {...register("price", {
                setValueAs: (v) => (v === "" || v == null ? 0 : Number(String(v).replace(/\D/g, ""))),
              })}
            />
          </div>
          <p className="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
            {price > 0 ? `Rp ${formatIDR(price)}` : "Gratis (Rp 0)"}
          </p>
        </Field>

        <Field
          label="Harga Coret"
          htmlFor="fakePrice"
          optional
          hint="Harga asli yang dicoret untuk efek diskon."
          error={errors.fakePrice?.message}
        >
          <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-zinc-200 focus-within:border-[color:var(--color-brand-400)] dark:border-[color:var(--color-surface-border)]">
            <span className="select-none border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.03]">
              Rp
            </span>
            <input
              id="fakePrice"
              inputMode="numeric"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm tabular-nums outline-none disabled:opacity-60"
              placeholder="Kosongkan jika tidak ada"
              disabled={disabled}
              {...register("fakePrice", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(String(v).replace(/\D/g, "")),
              })}
            />
          </div>
          <p className="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
            {fakePrice && fakePrice > 0 ? `Rp ${formatIDR(fakePrice)}` : "—"}
          </p>
        </Field>
      </div>

      <Field label="Yang Akan Dipelajari" hint="Poin-poin benefit yang tampil di halaman detail.">
        <div className="flex items-center gap-2 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]">
          <ListChecks className="size-4" strokeWidth={2.2} />
          <span className="text-xs font-semibold uppercase tracking-wide">Benefit</span>
        </div>
        <BenefitListField disabled={disabled} />
      </Field>

      <Field label="FAQ" optional hint="Pertanyaan umum calon peserta.">
        <div className="flex items-center gap-2 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]">
          <HelpCircle className="size-4" strokeWidth={2.2} />
          <span className="text-xs font-semibold uppercase tracking-wide">Tanya Jawab</span>
        </div>
        <FaqListField disabled={disabled} />
      </Field>

      <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 px-4 py-3.5 dark:border-[color:var(--color-surface-border)]">
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <Sparkles className="size-4" strokeWidth={2.2} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              Tampilkan sebagai Unggulan
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              Kursus muncul di slot featured pada katalog.
            </span>
          </span>
        </span>
        <Switch
          checked={Boolean(isFeatured)}
          disabled={disabled}
          onCheckedChange={(v) => setValue("isFeatured", v)}
        />
      </label>
    </SectionCard>
  );
}
