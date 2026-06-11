"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type {
  BatchRow,
  ClassRow,
  FieldRow,
} from "@/lib/admin-internship-config-query";
import {
  classCreateSchema,
  classUpdateSchema,
  type ClassCreateInput,
  type ClassUpdateInput,
} from "@/lib/validations/admin-internship-config";
import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from "@/hooks/use-admin-internship-config-actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field } from "./form-field";

/** Mirror of the server's `nextLetter` — next free A..Z within a field. */
function previewLetter(classNamesInField: string[]): string | null {
  let max = 64;
  for (const n of classNamesInField) {
    const seg = (n.split(" - ").pop() ?? "").trim();
    if (seg.length === 1) {
      const code = seg.toUpperCase().charCodeAt(0);
      if (code >= 65 && code <= 90 && code > max) max = code;
    }
  }
  const next = max + 1;
  return next > 90 ? null : String.fromCharCode(next);
}

// ===== Create ===============================================================

type CreateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: BatchRow[];
  fields: FieldRow[];
  classes: ClassRow[];
  onSubmitted: () => void;
};

export function ClassCreateDialog({
  open,
  onOpenChange,
  batches,
  fields,
  classes,
  onSubmitted,
}: CreateProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassCreateInput>({
    resolver: zodResolver(classCreateSchema),
    defaultValues: { batchId: "", fieldId: "" },
  });

  const batchId = watch("batchId");
  const fieldId = watch("fieldId");

  const fieldOptions = useMemo(
    () => (batchId ? fields.filter((f) => f.batchId === batchId) : []),
    [fields, batchId],
  );

  const nextLetter = useMemo(() => {
    if (!fieldId) return null;
    const names = classes.filter((c) => c.fieldId === fieldId).map((c) => c.name);
    return previewLetter(names);
  }, [classes, fieldId]);

  const createMutation = useCreateClassMutation();

  const onValid = (values: ClassCreateInput) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Kelas berhasil dibuat.");
        onSubmitted();
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal membuat kelas."),
    });
  };

  const batchName = (id: string) =>
    batches.find((b) => b.id === id)?.name ?? "Pilih batch";
  const fieldName = (id: string) =>
    fields.find((f) => f.id === id)?.name ?? "Pilih bidang";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Kelas</DialogTitle>
          <DialogDescription>
            Pilih batch lalu bidang. Nama kelas (huruf A, B, …) ditetapkan otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Batch" error={errors.batchId?.message}>
            <Controller
              control={control}
              name="batchId"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(v) => {
                    if (typeof v === "string") {
                      field.onChange(v);
                      setValue("fieldId", ""); // cascade reset
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Pilih batch">
                    <SelectValue placeholder="Pilih batch">
                      {(v: string) => (v ? batchName(v) : "Pilih batch")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Bidang"
            error={errors.fieldId?.message}
            hint={!batchId ? "Pilih batch terlebih dahulu." : undefined}
          >
            <Controller
              control={control}
              name="fieldId"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  disabled={!batchId || fieldOptions.length === 0}
                  onValueChange={(v) => {
                    if (typeof v === "string") field.onChange(v);
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Pilih bidang">
                    <SelectValue placeholder="Pilih bidang">
                      {(v: string) => (v ? fieldName(v) : "Pilih bidang")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {fieldOptions.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {fieldId ? (
            <div className="rounded-xl bg-[color:var(--color-brand-50)] px-4 py-3 text-sm text-[color:var(--color-brand-800)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/10 dark:text-[color:var(--color-brand-100)] dark:ring-[color:var(--color-brand-500)]/30">
              {nextLetter ? (
                <>
                  Kelas berikutnya:{" "}
                  <span className="font-bold">Kelas {nextLetter}</span>
                </>
              ) : (
                "Bidang ini sudah memiliki kelas hingga huruf Z."
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !nextLetter}
            >
              {createMutation.isPending ? "Menyimpan…" : "Buat Kelas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== Edit (capacity) ======================================================

type EditProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ClassRow;
  onSubmitted: () => void;
};

export function ClassEditDialog({
  open,
  onOpenChange,
  initial,
  onSubmitted,
}: EditProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassUpdateInput>({
    resolver: zodResolver(classUpdateSchema),
    defaultValues: { maxStudents: initial.maxStudents },
  });

  const updateMutation = useUpdateClassMutation(initial.id);

  const onValid = (values: ClassUpdateInput) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Kapasitas kelas tersimpan.");
        onSubmitted();
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan kelas."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
          <DialogDescription>
            {initial.batchName} · {initial.fieldName} · Kelas {initial.letter}. Atur
            kapasitas maksimal peserta (saat ini {initial.studentCount} peserta).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Kapasitas Maksimal" error={errors.maxStudents?.message}>
            <Input
              type="number"
              min={1}
              max={100}
              {...register("maxStudents", { valueAsNumber: true })}
              className="h-11 rounded-xl"
              autoFocus
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
