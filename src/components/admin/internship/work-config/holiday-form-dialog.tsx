"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange } from "lucide-react";
import { toast } from "sonner";

import type { HolidayRow } from "@/lib/admin-internship-holiday-query";
import {
  holidayEditFormSchema,
  type HolidayEditFormInput,
} from "@/lib/validations/admin-internship-holiday";
import {
  useCreateHolidayMutation,
  useEditHolidayMutation,
} from "@/hooks/use-admin-internship-holiday-actions";

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

import { Field } from "@/components/admin/internship/config/form-field";
import { addDaysIso, formatDMY } from "./date-utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Server-computed today (WIB) — minimum selectable start date. */
  todayISO: string;
  initial?: HolidayRow;
  onSubmitted: () => void;
};

function buildDefaults(todayISO: string, initial?: HolidayRow): HolidayEditFormInput {
  return {
    description: initial?.description ?? "",
    days: initial?.days ?? 1,
    startDate: initial?.startDate ?? todayISO,
    reason: "",
  };
}

export function HolidayFormDialog({
  open,
  onOpenChange,
  mode,
  todayISO,
  initial,
  onSubmitted,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HolidayEditFormInput>({
    resolver: zodResolver(holidayEditFormSchema),
    defaultValues: buildDefaults(todayISO, initial),
  });

  const createMutation = useCreateHolidayMutation();
  const editMutation = useEditHolidayMutation(initial?.id ?? "");
  const submitting = createMutation.isPending || editMutation.isPending;

  // Live preview of the effective span (matches the server's endDate = start + days-1).
  const start = watch("startDate");
  const rawDays = watch("days");
  const days = Number.isFinite(rawDays) ? Math.trunc(rawDays) : 0;
  const preview =
    /^\d{4}-\d{2}-\d{2}$/.test(start) && days >= 1
      ? `Berlaku ${formatDMY(start)} – ${formatDMY(addDaysIso(start, days - 1))} (${days} hari)`
      : null;

  const onValid = (values: HolidayEditFormInput) => {
    if (mode === "create") {
      createMutation.mutate(
        { description: values.description, days: values.days, startDate: values.startDate },
        {
          onSuccess: () => {
            toast.success("Tanggal libur berhasil ditambahkan.");
            onSubmitted();
            onOpenChange(false);
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : "Gagal menambah libur."),
        },
      );
      return;
    }
    editMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Perubahan libur tersimpan.");
        onSubmitted();
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan libur."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Tanggal Libur" : "Edit Tanggal Libur"}
          </DialogTitle>
          <DialogDescription>
            Isi keterangan, jumlah hari libur, dan tanggal mulai. Tanggal selesai
            dihitung otomatis (mis. 3 hari mulai tanggal 11 → berlaku 11–13).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Keterangan Libur" error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="cth. Cuti bersama Idul Fitri"
              rows={2}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Jumlah Hari" error={errors.days?.message}>
              <Input
                type="number"
                min={1}
                max={60}
                {...register("days", { valueAsNumber: true })}
                className="h-11 rounded-xl"
              />
            </Field>
            <Field
              label="Tanggal Mulai"
              error={errors.startDate?.message}
              hint="Hari pertama libur"
            >
              <Input
                type="date"
                min={todayISO}
                {...register("startDate")}
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          {preview ? (
            <div className="flex items-center gap-2 rounded-xl bg-[color:var(--color-brand-50)] px-3 py-2.5 text-sm font-semibold text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/10 dark:text-[color:var(--color-brand-200)]">
              <CalendarRange className="size-4 shrink-0" strokeWidth={2.4} />
              {preview}
            </div>
          ) : null}

          {mode === "edit" ? (
            <Field
              label="Alasan Perubahan (opsional)"
              error={errors.reason?.message}
              hint="Dicatat pada audit trail"
            >
              <Input
                {...register("reason")}
                placeholder="cth. Penyesuaian jadwal"
                className="h-11 rounded-xl"
              />
            </Field>
          ) : null}

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
                  ? "Tambah Libur"
                  : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
