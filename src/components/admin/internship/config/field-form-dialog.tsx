"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { BatchRow, FieldRow } from "@/lib/admin-internship-config-query";
import {
  fieldCreateSchema,
  fieldUpdateSchema,
} from "@/lib/validations/admin-internship-config";
import {
  useCreateFieldMutation,
  useUpdateFieldMutation,
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
import { WarningBanner } from "./warning-banner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** All batches — populates the create-mode batch picker. */
  batches: BatchRow[];
  /** Present only in edit mode. */
  initial?: FieldRow;
  onSubmitted: () => void;
};

export function FieldFormDialog({
  open,
  onOpenChange,
  mode,
  batches,
  initial,
  onSubmitted,
}: Props) {
  type FieldFormValues = {
    batchId: string;
    kode_bidang: string;
    name: string;
  };

  const resolver = mode === "create" ? fieldCreateSchema : fieldUpdateSchema;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldFormValues>({
    resolver: zodResolver(resolver) as never,
    defaultValues: {
      batchId: initial?.batchId ?? "",
      kode_bidang: initial?.kodeBidang ?? "",
      name: initial?.name ?? "",
    },
  });

  const createMutation = useCreateFieldMutation();
  const updateMutation = useUpdateFieldMutation(initial?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  const onValid = (values: { batchId: string; kode_bidang: string; name: string }) => {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Bidang berhasil dibuat.");
          onSubmitted();
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Gagal membuat bidang."),
      });
    } else {
      updateMutation.mutate(
        { kode_bidang: values.kode_bidang, name: values.name },
        {
          onSuccess: () => {
            toast.success("Perubahan bidang tersimpan.");
            onSubmitted();
            onOpenChange(false);
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : "Gagal menyimpan bidang."),
        },
      );
    }
  };

  const batchName = (id: string) =>
    batches.find((b) => b.id === id)?.name ?? "Pilih batch";

  const nameVal = watch("name") || "";
  const kodeVal = watch("kode_bidang") || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Bidang" : "Edit Bidang"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Pilih batch lalu masukkan nama bidang (cth. Data Analyst)."
              : "Ubah nama bidang. Batch tidak dapat dipindah."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Batch" error={errors.batchId?.message}>
            {mode === "edit" ? (
              <Input
                value={initial ? `${initial.batchName}` : ""}
                disabled
                className="h-11 rounded-xl"
              />
            ) : (
              <Controller
                control={control}
                name="batchId"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(v) => {
                      if (typeof v === "string") field.onChange(v);
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
            )}
          </Field>

          <Field label="Nama Bidang" current={nameVal.length} max={100} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="cth. Data Analyst"
              maxLength={100}
              className="h-11 rounded-xl"
            />
          </Field>

          <Field label="Kode Bidang" current={kodeVal.length} max={3} error={errors.kode_bidang?.message}>
            <Input
              {...register("kode_bidang")}
              placeholder="111"
              maxLength={3}
              className="h-11 rounded-xl font-mono"
            />
          </Field>

          {mode === "create" && (
            <WarningBanner severity="soft">
              Kode bidang digunakan dalam nomor induk peserta magang. Tidak dapat diubah setelah
              bidang memiliki peserta.
            </WarningBanner>
          )}

          {mode === "edit" && (
            <WarningBanner severity="hard">
              Jika bidang sudah memiliki peserta magang, perubahan kode bidang akan ditolak.
            </WarningBanner>
          )}

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
                  ? "Buat Bidang"
                  : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
