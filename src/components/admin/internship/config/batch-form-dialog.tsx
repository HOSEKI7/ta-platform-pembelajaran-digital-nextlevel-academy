"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { BatchRow } from "@/lib/admin-internship-config-query";
import {
  batchFormSchema,
  type BatchFormInput,
} from "@/lib/validations/admin-internship-config";
import {
  useCreateBatchMutation,
  useUpdateBatchMutation,
} from "@/hooks/use-admin-internship-config-actions";
import { useInternshipConfigQuery } from "@/hooks/use-admin-internship-config";

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
import { Textarea } from "@/components/ui/textarea";

import { Field } from "./form-field";
import { WarningBanner } from "./warning-banner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: BatchRow;
  onSubmitted: () => void;
};

function buildDefaults(initial?: BatchRow): BatchFormInput {
  return {
    name: initial?.name ?? "",
    kode_batch: initial?.kodeBatch ?? "",
    description: initial?.description ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
  };
}

export function BatchFormDialog({
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
  } = useForm<BatchFormInput>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: buildDefaults(initial),
  });

  const createMutation = useCreateBatchMutation();
  const updateMutation = useUpdateBatchMutation(initial?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  const config = useInternshipConfigQuery();

  const kodeBatchPreview = useMemo(() => {
    if (mode !== "create" || !config.data) return null;
    const codes = config.data.batches
      .map((b) => b.kodeBatch)
      .filter((k): k is string => k !== null)
      .sort();
    const next =
      codes.length > 0
        ? String(parseInt(codes[codes.length - 1], 10) + 1).padStart(2, "0")
        : "01";
    return next;
  }, [mode, config.data]);

  const onValid = (values: BatchFormInput) => {
    const mutation = mode === "create" ? createMutation : updateMutation;
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          mode === "create" ? "Batch berhasil dibuat." : "Perubahan batch tersimpan.",
        );
        onSubmitted();
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan batch."),
    });
  };

  const nameVal = watch("name") || "";
  const descVal = watch("description") || "";
  const kodeVal = watch("kode_batch") || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Batch" : "Edit Batch"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat periode magang baru. Tanggal mulai & selesai menjadi dasar kalender absensi."
              : "Ubah nama, keterangan, atau periode batch."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Nama Batch" current={nameVal.length} max={100} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="cth. Batch 1"
              maxLength={100}
              className="h-11 rounded-xl"
              autoFocus
            />
          </Field>

          <Field label="Kode Batch" current={kodeVal.length} max={3} error={errors.kode_batch?.message}>
            <Input
              {...register("kode_batch")}
              placeholder={kodeBatchPreview ?? "001"}
              maxLength={3}
              className="h-11 rounded-xl font-mono"
            />
            {mode === "create" && kodeBatchPreview && (
              <p className="mt-1 text-xs text-muted-foreground">
                Pratinjau: <span className="font-mono">{kodeBatchPreview}</span>
              </p>
            )}
          </Field>

          {mode === "create" && (
            <WarningBanner severity="soft">
              Kode batch (3 digit) digunakan sebagai prefix nomor induk peserta magang. Tidak dapat diubah
              setelah peserta magang terdaftar.
            </WarningBanner>
          )}

          {mode === "edit" && (
            <WarningBanner severity="hard">
              Jika batch sudah memiliki peserta magang, perubahan kode batch akan ditolak.
            </WarningBanner>
          )}

          <Field label="Keterangan" current={descVal.length} max={300} error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="cth. Batch 1 Magang Periode November 2025 - Januari 2026"
              maxLength={300}
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tanggal Mulai" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} className="h-11 rounded-xl" />
            </Field>
            <Field label="Tanggal Selesai" error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} className="h-11 rounded-xl" />
            </Field>
          </div>

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
                  ? "Buat Batch"
                  : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
