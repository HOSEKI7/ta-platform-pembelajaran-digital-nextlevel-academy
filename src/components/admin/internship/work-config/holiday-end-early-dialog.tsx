"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Info } from "lucide-react";
import { toast } from "sonner";

import type { HolidayRow } from "@/lib/admin-internship-holiday-query";
import {
  holidayEndEarlyFormSchema,
  type HolidayEndEarlyFormInput,
} from "@/lib/validations/admin-internship-holiday";
import { useEndEarlyHolidayMutation } from "@/hooks/use-admin-internship-holiday-actions";

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
import { daysBetweenInclusive, formatDMY } from "./date-utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Server-computed today (WIB) — minimum (non-retroactive) new end date. */
  todayISO: string;
  initial: HolidayRow;
  onSubmitted: () => void;
};

export function HolidayEndEarlyDialog({
  open,
  onOpenChange,
  todayISO,
  initial,
  onSubmitted,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HolidayEndEarlyFormInput>({
    resolver: zodResolver(holidayEndEarlyFormSchema),
    defaultValues: {
      description: initial.description,
      newEndDate: todayISO,
      reason: "",
    },
  });

  const mutation = useEndEarlyHolidayMutation(initial.id);

  const newEnd = watch("newEndDate");
  const preview =
    /^\d{4}-\d{2}-\d{2}$/.test(newEnd) &&
    newEnd >= todayISO &&
    newEnd <= initial.endDate
      ? `Libur akan berlaku ${formatDMY(initial.startDate)} – ${formatDMY(newEnd)} (${daysBetweenInclusive(initial.startDate, newEnd)} hari)`
      : null;

  const onValid = (values: HolidayEndEarlyFormInput) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Libur berhasil diakhiri lebih awal.");
        onSubmitted();
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal mengakhiri libur."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Akhiri Libur Lebih Awal</DialogTitle>
          <DialogDescription>
            Libur <span className="font-semibold text-foreground">{initial.description}</span>{" "}
            sedang berlangsung. Anda hanya dapat memperpendek tanggal selesai (tidak
            dapat memundurkan ke masa lalu atau memperpanjang).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <Field label="Keterangan Libur" error={errors.description?.message}>
            <Textarea {...register("description")} rows={2} />
          </Field>

          <Field
            label="Tanggal Selesai Baru"
            error={errors.newEndDate?.message}
            hint={`Antara hari ini (${formatDMY(todayISO)}) dan ${formatDMY(initial.endDate)}`}
          >
            <Input
              type="date"
              min={todayISO}
              max={initial.endDate}
              {...register("newEndDate")}
              className="h-11 rounded-xl"
            />
          </Field>

          {preview ? (
            <div className="flex items-center gap-2 rounded-xl bg-[color:var(--color-brand-50)] px-3 py-2.5 text-sm font-semibold text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/10 dark:text-[color:var(--color-brand-200)]">
              <CalendarRange className="size-4 shrink-0" strokeWidth={2.4} />
              {preview}
            </div>
          ) : null}

          <Field
            label="Alasan (opsional)"
            error={errors.reason?.message}
            hint="Dicatat pada audit trail"
          >
            <Input
              {...register("reason")}
              placeholder="cth. Libur dibatalkan, kembali masuk"
              className="h-11 rounded-xl"
            />
          </Field>

          <p className="flex items-start gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Info className="mt-px size-3.5 shrink-0" strokeWidth={2.2} />
            Tanggal mulai dan tanggal yang sudah lewat tidak berubah, sehingga
            absensi hari-hari sebelumnya tetap terjaga.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan…" : "Akhiri Lebih Awal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
