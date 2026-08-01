"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { AdminCategoryRow } from "@/lib/admin-categories-query";
import {
  categoryFormSchema,
  type CategoryFormInput,
} from "@/lib/validations/admin-category";

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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/hooks/use-admin-category-form";

import { CharCounter } from "@/components/ui/char-counter";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Present only in edit mode. */
  initial?: AdminCategoryRow;
  onSubmitted: () => void;
};

function buildDefaults(initial?: AdminCategoryRow): CategoryFormInput {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmitted,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: buildDefaults(initial),
  });

  const nameVal = watch("name") || "";
  const descVal = watch("description") || "";

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation(initial?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  const onValid = (values: CategoryFormInput) => {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Kategori berhasil dibuat.");
          onSubmitted();
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal membuat kategori.",
          ),
      });
    } else {
      updateMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Perubahan kategori tersimpan.");
          onSubmitted();
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal menyimpan kategori.",
          ),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat kategori baru untuk mengelompokkan kursus."
              : "Ubah nama atau deskripsi kategori."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Nama Kategori" current={nameVal.length} max={100} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="cth. Web Programming"
              maxLength={100}
              className="h-11 rounded-xl"
              autoFocus
            />
          </Field>

          <Field
            label="Deskripsi (opsional)"
            current={descVal.length}
            max={300}
            error={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              placeholder="Keterangan singkat tentang kategori ini."
              rows={3}
              maxLength={300}
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
                  ? "Buat Kategori"
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
  current?: number;
  max?: number;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, current, max, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {label}
        </Label>
        {max !== undefined && current !== undefined ? (
          <CharCounter current={current} max={max} />
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
