"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, GraduationCap, Loader2, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Role } from "@/generated/prisma";
import { ROLE_LABELS, type ClassOption } from "@/lib/admin-users-query";
import {
  CREATABLE_ROLE_VALUES,
  createUserSchema,
  type CreateUserInput,
} from "@/lib/validations/admin-user";
import { useCreateUserMutation } from "@/hooks/use-admin-user-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Field } from "@/components/admin/courses/form/field";
import { SectionCard } from "@/components/admin/courses/form/section-card";

import { ClassSelect } from "./form/class-select";
import { PasswordInput } from "./form/password-input";

type Props = { classOptions: ClassOption[] };

export function CreateUserView({ classOptions }: Props) {
  const router = useRouter();
  const createMutation = useCreateUserMutation();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: Role.PESERTA_DIDIK,
      name: "",
      email: "",
      password: "",
      classId: "",
      institution: "",
    },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const role = useWatch({ control, name: "role" });
  const needsClass = role === Role.PESERTA_MAGANG || role === Role.MENTOR;
  const isMagang = role === Role.PESERTA_MAGANG;

  const submit = handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success(`Akun “${values.name}” berhasil dibuat.`);
        router.push("/admin/users");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal membuat akun."),
    });
  });

  const busy = createMutation.isPending;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/users"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="size-4" strokeWidth={2.4} />
          Kembali ke Daftar Pengguna
        </Link>
        <PageHeader
          eyebrow="Admin · Manajemen Pengguna"
          title="Tambah"
          accent="Pengguna"
          description="Buat akun baru. Mentor & Peserta Magang wajib ditempatkan ke sebuah kelas."
        />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        <SectionCard
          icon={UserPlus}
          title="Informasi Akun"
          description="Role, identitas, dan password awal."
        >
          <Field label="Role" error={errors.role?.message}>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    if (typeof v === "string") field.onChange(v as Role);
                  }}
                  disabled={busy}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Role">
                    <SelectValue>
                      {(v: string) => ROLE_LABELS[v as Role] ?? "Pilih role…"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CREATABLE_ROLE_VALUES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Nama Lengkap" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="mis. Budi Santoso"
              className="h-11 rounded-xl"
              disabled={busy}
              {...register("name")}
            />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="h-11 rounded-xl"
              autoComplete="off"
              disabled={busy}
              {...register("email")}
            />
          </Field>

          <Field
            label="Password Awal"
            htmlFor="password"
            error={errors.password?.message}
            hint="Minimal 8 karakter dengan huruf besar, kecil, dan angka."
          >
            <PasswordInput
              id="password"
              placeholder="Password awal"
              autoComplete="new-password"
              disabled={busy}
              {...register("password")}
            />
          </Field>
        </SectionCard>

        {needsClass ? (
          <SectionCard
            icon={GraduationCap}
            title="Penempatan"
            description="Kelas sudah mencakup Batch dan Bidang."
          >
            <Field label="Kelas" error={errors.classId?.message}>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <ClassSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={classOptions}
                    disabled={busy}
                    showQuota={isMagang}
                  />
                )}
              />
            </Field>

            {isMagang ? (
              <Field
                label="Institusi"
                htmlFor="institution"
                optional
                error={errors.institution?.message}
                hint="Universitas atau sekolah peserta magang."
              >
                <Input
                  id="institution"
                  placeholder="mis. Universitas Indonesia"
                  className="h-11 rounded-xl"
                  disabled={busy}
                  {...register("institution")}
                />
              </Field>
            ) : null}
          </SectionCard>
        ) : null}

        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-lg shadow-zinc-900/5 backdrop-blur dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]/90">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={busy}
            onClick={() => router.push("/admin/users")}
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={busy}
            className="bg-[color:var(--color-brand-600)] px-5 text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <Save className="size-4" strokeWidth={2.4} />
            )}
            {busy ? "Menyimpan…" : "Simpan Akun"}
          </Button>
        </div>
      </form>
    </div>
  );
}
