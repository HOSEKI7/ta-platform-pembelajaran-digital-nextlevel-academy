"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { BadgeIconOption } from "@/lib/badge-icons";
import type { AdminBadgeRow, BadgeCourseOption } from "@/lib/admin-badges-query";
import { TRIGGER_LABELS } from "@/lib/admin-badges-query";
import type { BadgeTriggerKey } from "@/lib/gamification-types";
import { badgeFormSchema, type BadgeFormInput } from "@/lib/validations/admin-badge";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
} from "@/hooks/use-admin-badge-form";

import { BadgeIconPicker, type BadgeIconValue } from "./badge-icon-picker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Present only in edit mode. */
  initial?: AdminBadgeRow;
  courseOptions: BadgeCourseOption[];
  iconPresets: BadgeIconOption[];
  onSubmitted: () => void;
};

const TRIGGER_OPTIONS: BadgeTriggerKey[] = [
  "LEVEL_REACHED",
  "COURSES_COMPLETED",
  "COURSE_SPECIFIC",
];

function buildDefaults(initial?: AdminBadgeRow): BadgeFormInput {
  if (initial) {
    return {
      name: initial.name,
      description: initial.description ?? "",
      trigger: initial.trigger,
      threshold: initial.threshold,
      courseId: initial.courseId,
      expMinimum: initial.expMinimum,
      logoUrl: initial.logoStored,
    };
  }
  return {
    name: "",
    description: "",
    trigger: "LEVEL_REACHED",
    threshold: 1,
    courseId: null,
    expMinimum: 0,
    logoUrl: null,
  };
}

export function BadgeFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  courseOptions,
  iconPresets,
  onSubmitted,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BadgeFormInput>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: buildDefaults(initial),
  });

  const [icon, setIcon] = useState<BadgeIconValue>({
    stored: initial?.logoStored ?? null,
    preview: initial?.logoUrl ?? null,
  });

  const createMutation = useCreateBadgeMutation();
  const updateMutation = useUpdateBadgeMutation(initial?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  const trigger = watch("trigger") as BadgeTriggerKey;
  const threshold = watch("threshold");
  const isCourseSpecific = trigger === "COURSE_SPECIFIC";

  const onValid = (values: BadgeFormInput) => {
    const payload: BadgeFormInput = { ...values, logoUrl: icon.stored };
    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Badge berhasil dibuat.");
          onSubmitted();
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Gagal membuat badge."),
      });
    } else {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Perubahan badge tersimpan.");
          onSubmitted();
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Gagal menyimpan badge."),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-xl overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Badge" : "Edit Badge"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat badge baru. Jenis trigger tidak dapat diubah setelah disimpan."
              : "Ubah detail badge. Jenis trigger dikunci."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex min-w-0 flex-col gap-5">
          {/* Trigger */}
          <Field label="Trigger" error={errors.trigger?.message}>
            <Controller
              control={control}
              name="trigger"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    if (typeof v === "string") {
                      field.onChange(v);
                      // Reset trigger-specific fields when switching type.
                      if (v === "COURSE_SPECIFIC") setValue("threshold", 0);
                      else setValue("courseId", null);
                    }
                  }}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Trigger">
                    <SelectValue>
                      {(val: string) =>
                        TRIGGER_LABELS[val as BadgeTriggerKey] ?? "Pilih trigger"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TRIGGER_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {/* Name */}
          <Field label="Nama Badge" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="cth. Penjelajah Pemula"
              className="h-11 rounded-xl"
            />
          </Field>

          {/* Description / cara mendapat */}
          <Field
            label="Deskripsi cara mendapat (opsional)"
            error={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              placeholder="Kosongkan untuk memakai teks otomatis berdasarkan trigger."
              rows={2}
            />
          </Field>

          {/* Threshold OR course */}
          {isCourseSpecific ? (
            <Field label="Kursus" error={errors.courseId?.message}>
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) =>
                      field.onChange(typeof v === "string" && v ? v : null)
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Kursus">
                      <SelectValue>
                        {(val: string | null | undefined) =>
                          courseOptions.find((c) => c.id === val)?.title ??
                          "Pilih kursus"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          ) : (
            <Field
              label={
                trigger === "LEVEL_REACHED"
                  ? "Level yang harus dicapai"
                  : "Jumlah kursus yang harus diselesaikan"
              }
              error={errors.threshold?.message}
            >
              <Input
                type="number"
                min={1}
                {...register("threshold", { valueAsNumber: true })}
                className="h-11 rounded-xl"
              />
            </Field>
          )}

          {/* EXP minimum (informational) */}
          <Field
            label="EXP (informasi)"
            error={errors.expMinimum?.message}
            hint="Hanya ditampilkan sebagai metadata; tidak memengaruhi pemberian EXP."
          >
            <Input
              type="number"
              min={0}
              {...register("expMinimum", { valueAsNumber: true })}
              className="h-11 rounded-xl"
            />
          </Field>

          {/* Icon */}
          <Field label="Ikon Badge">
            <BadgeIconPicker
              value={icon}
              onChange={setIcon}
              presets={iconPresets}
              trigger={trigger}
              threshold={Number.isFinite(threshold) ? threshold : 0}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Menyimpan…"
                : mode === "create"
                  ? "Buat Badge"
                  : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-[11px] text-zinc-400">{hint}</p>
      ) : null}
      {error ? <p className="text-[11px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
