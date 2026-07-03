"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatInTimeZone } from "date-fns-tz";
import { fromZonedTime } from "date-fns-tz";
import { Loader2, Percent, Save, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  type VoucherDiscountTypeValue,
  type VoucherFormInput,
  voucherFormSchema,
} from "@/lib/validations/admin-voucher";
import { Badge } from "@/components/ui/badge";
import { ComboboxField } from "./combobox-field";

const WIB_TZ = "Asia/Jakarta";

const EMPTY: VoucherFormInput = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountPct: 10,
  discountAmount: null,
  maxUsage: null,
  startDate: "",
  endDate: "",
  allowedCourseId: null,
  allowedCategoryId: null,
  maxOneUsePerUser: false,
};

/** UTC ISO → WIB wall-clock string for `<input type="datetime-local">`. */
function isoToWibInput(iso: string): string {
  if (!iso) return "";
  return formatInTimeZone(new Date(iso), WIB_TZ, "yyyy-MM-dd'T'HH:mm");
}

/** WIB wall-clock string → UTC ISO (the form's stored value). */
function wibInputToIso(wall: string): string {
  if (!wall) return "";
  return fromZonedTime(wall, WIB_TZ).toISOString();
}

type CourseOption = { id: string; title: string; categoryId: string; status: string };
type CategoryOption = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  initial?: VoucherFormInput;
  submitting: boolean;
  onSubmit: (values: VoucherFormInput) => void;
  onCancel: () => void;
  courses: CourseOption[];
  categories: CategoryOption[];
  /** Rendered below the form (Edit action zone: deactivate / delete). */
  footerSlot?: React.ReactNode;
};

function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
        >
          {label}
        </Label>
        {optional ? (
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:bg-white/10 dark:text-zinc-500">
            Opsional
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="-mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function VoucherForm({
  mode,
  initial,
  submitting,
  onSubmit,
  onCancel,
  courses,
  categories,
  footerSlot,
}: Props) {
  const form = useForm<VoucherFormInput>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: initial ?? EMPTY,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState,
  } = form;
  const errors = formState.errors;

  const discountType = watch("discountType");
  const maxOneUsePerUser = watch("maxOneUsePerUser");

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] sm:p-6">
        <Field
          label="Kode Voucher"
          htmlFor="code"
          hint="Huruf, angka, '_' dan '-'. Bersifat case-sensitive (huruf besar/kecil berpengaruh)."
          error={errors.code?.message}
        >
          <Input
            id="code"
            {...register("code")}
            placeholder="mis. PROMOJUNI"
            autoComplete="off"
            disabled={submitting}
            className="h-10 font-mono uppercase"
          />
        </Field>

        <Field
          label="Deskripsi"
          htmlFor="description"
          optional
          hint="Catatan internal singkat tentang voucher ini."
          error={errors.description?.message}
        >
          <Textarea
            id="description"
            {...register("description")}
            placeholder="mis. Promo pembukaan batch Juni"
            disabled={submitting}
            rows={2}
          />
        </Field>

        {/* Discount type toggle */}
        <Field label="Tipe Diskon" error={errors.discountType?.message}>
          <Controller
            control={control}
            name="discountType"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "PERCENTAGE", label: "Persentase", icon: Percent },
                    { value: "FIXED", label: "Nominal (Rp)", icon: Wallet },
                  ] as {
                    value: VoucherDiscountTypeValue;
                    label: string;
                    icon: typeof Percent;
                  }[]
                ).map((opt) => {
                  const active = field.value === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={submitting}
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                        active
                          ? "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-[color:var(--color-surface-border)] dark:text-zinc-300",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={2.4} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>

        {/* Discount value — bound field depends on type */}
        {discountType === "PERCENTAGE" ? (
          <Field
            label="Persentase Diskon"
            htmlFor="discountPct"
            hint="Antara 1–100%."
            error={errors.discountPct?.message}
          >
            <Controller
              control={control}
              name="discountPct"
              render={({ field }) => (
                <div className="relative w-40">
                  <Input
                    id="discountPct"
                    type="number"
                    min={1}
                    max={100}
                    inputMode="numeric"
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    disabled={submitting}
                    className="h-10 pr-8 tabular-nums"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                    %
                  </span>
                </div>
              )}
            />
          </Field>
        ) : (
          <Field
            label="Nominal Diskon"
            htmlFor="discountAmount"
            hint="Potongan tetap dalam Rupiah."
            error={errors.discountAmount?.message}
          >
            <Controller
              control={control}
              name="discountAmount"
              render={({ field }) => (
                <div className="relative w-56">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                    Rp
                  </span>
                  <Input
                    id="discountAmount"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    disabled={submitting}
                    className="h-10 pl-9 tabular-nums"
                  />
                </div>
              )}
            />
          </Field>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Mulai Berlaku"
            htmlFor="startDate"
            optional
            hint="Waktu WIB. Kosongkan agar aktif saat dibuat."
            error={errors.startDate?.message}
          >
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={isoToWibInput(field.value)}
                  onChange={(e) =>
                    field.onChange(wibInputToIso(e.target.value))
                  }
                  disabled={submitting}
                  className="h-10"
                />
              )}
            />
          </Field>

          <Field
            label="Berakhir"
            htmlFor="endDate"
            hint="Waktu WIB. Voucher berhenti berlaku setelah tanggal ini."
            error={errors.endDate?.message}
          >
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={isoToWibInput(field.value)}
                  onChange={(e) =>
                    field.onChange(wibInputToIso(e.target.value))
                  }
                  disabled={submitting}
                  className="h-10"
                />
              )}
            />
          </Field>
        </div>
      </section>

      {/* Scope & restrictions */}
      <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] sm:p-6">
        <h3 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Batasan Pemakaian
        </h3>

        <Controller
          control={control}
          name="allowedCategoryId"
          render={({ field }) => (
            <Field
              label="Berlaku untuk kategori"
              hint='Pilih kategori tertentu atau biarkan "Semua Kategori".'
              error={errors.allowedCategoryId?.message}
            >
              <ComboboxField
                label="kategori"
                items={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  // Manual override: if course is selected but category differs, reset course
                  const currentCourseId = getValues("allowedCourseId");
                  if (currentCourseId) {
                    const course = courses.find(
                      (c) => c.id === currentCourseId,
                    );
                    if (course && v !== course.categoryId) {
                      setValue("allowedCourseId", null);
                    }
                  }
                }}
                placeholder="Semua Kategori"
                searchPlaceholder="Cari kategori…"
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="allowedCourseId"
          render={({ field }) => (
            <Field
              label="Berlaku untuk kursus"
              hint={
                maxOneUsePerUser
                  ? "Tidak bisa dikombinasikan dengan batas 1 kali per pengguna."
                  : 'Pilih kursus tertentu atau biarkan "Semua Kursus".'
              }
              error={errors.allowedCourseId?.message}
            >
              <ComboboxField
                label="kursus"
                items={courses.map((c) => ({ value: c.id, label: c.title }))}
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  if (v) {
                    const course = courses.find((c) => c.id === v);
                    if (course)
                      setValue("allowedCategoryId", course.categoryId);
                  }
                }}
                placeholder="Semua Kursus"
                disabled={maxOneUsePerUser}
                searchPlaceholder="Cari kursus…"
                renderItem={(item) => {
                  const course = courses.find(
                    (c) => c.id === item.value,
                  );
                  if (!course || course.status === "PUBLISHED")
                    return <>{item.label}</>;
                  const isDraft = course.status === "DRAFT";
                  return (
                    <>
                      {item.label}
                      <Badge
                        className={cn(
                          "ml-auto text-[10px] font-bold capitalize ring-1",
                          isDraft
                            ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30"
                            : "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
                        )}
                      >
                        {isDraft ? "Draft" : "Archived"}
                      </Badge>
                    </>
                  );
                }}
              />
            </Field>
          )}
        />

        <Field
          label="Batas Pemakaian"
          htmlFor="scopeMaxUsage"
          optional
          hint="Total maksimal voucher dipakai semua pengguna. Kosongkan untuk tak terbatas."
          error={errors.maxUsage?.message}
        >
          <Controller
            control={control}
            name="maxUsage"
            render={({ field }) => (
              <Input
                id="scopeMaxUsage"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Tak terbatas"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                disabled={submitting}
                className="h-10 w-40 tabular-nums"
              />
            )}
          />
        </Field>

        <Controller
          control={control}
          name="maxOneUsePerUser"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition hover:bg-zinc-100 dark:border-[color:var(--color-surface-border)] dark:bg-white/[.02] dark:hover:bg-white/[.06]">
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Maksimal 1 kali per pengguna
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Setiap pengguna hanya bisa memakai voucher ini satu kali.
                  Pesanan gagal/batal dapat dicoba ulang.
                </span>
              </span>
              <Switch
                checked={field.value}
                onCheckedChange={(v) => {
                  field.onChange(v);
                  if (v) setValue("allowedCourseId", null);
                }}
              />
            </label>
          )}
        />
      </section>

      <div className="flex items-center justify-end gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]/90">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={submitting}
          onClick={onCancel}
        >
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
          {submitting
            ? "Menyimpan…"
            : mode === "create"
              ? "Buat Voucher"
              : "Simpan Perubahan"}
        </Button>
      </div>

      {footerSlot}
    </form>
  );
}
