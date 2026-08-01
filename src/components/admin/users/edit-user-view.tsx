"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  GraduationCap,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { Role } from "@/generated/prisma";
import type { ClassOption } from "@/lib/admin-users-query";
import type { AdminUserEditData } from "@/lib/admin-users-loader";
import { editUserSchema, type EditUserInput } from "@/lib/validations/admin-user";
import { useUpdateUserMutation } from "@/hooks/use-admin-user-form";
import { useSetTempPasswordMutation } from "@/hooks/use-admin-user-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Field } from "@/components/admin/courses/form/field";
import { SectionCard } from "@/components/admin/courses/form/section-card";

import { ClassSelect } from "./form/class-select";
import { GenderRadio } from "./form/gender-radio";
import { PasswordInput } from "./form/password-input";
import { UserRoleBadge } from "./user-role-badge";
import { SetTempPasswordDialog } from "./set-temp-password-dialog";

type Props = {
  user: AdminUserEditData;
  classOptions: ClassOption[];
};

export function EditUserView({ user, classOptions }: Props) {
  const router = useRouter();
  const updateMutation = useUpdateUserMutation(user.id);
  const tempPasswordMutation = useSetTempPasswordMutation();
  const [tempDialogOpen, setTempDialogOpen] = useState(false);
  const [mustChange, setMustChange] = useState(user.mustChangePassword);

  const needsClass = user.role === Role.PESERTA_MAGANG || user.role === Role.MENTOR;
  const isMagang = user.role === Role.PESERTA_MAGANG;
  const isMentor = user.role === Role.MENTOR;
  const isStudent = user.role === Role.PESERTA_DIDIK;

  const form = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role: user.role,
      name: user.name,
      email: user.email,
      username: user.username ?? "",
      classId: user.classId ?? "",
      institution: user.institution ?? "",
      gender: user.gender ?? undefined,
      newPassword: "",
    },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const busy = updateMutation.isPending;

  const submit = handleSubmit((values) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success(`Perubahan untuk “${values.name}” disimpan.`);
        router.push("/admin/users");
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal menyimpan perubahan.",
        ),
    });
  });

  const handleSetTempPassword = (tempPassword: string) => {
    tempPasswordMutation.mutate(
      { userId: user.id, tempPassword },
      {
        onSuccess: () => {
          toast.success("Password sementara disetel. Pengguna wajib menggantinya saat login.");
          setMustChange(true);
          setTempDialogOpen(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error
              ? err.message
              : "Gagal menyetel password sementara.",
          ),
      },
    );
  };

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
          title="Edit"
          accent="Pengguna"
          description="Perbarui identitas dan penempatan akun. Role tidak dapat diubah."
        />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        <SectionCard
          icon={UserCog}
          title="Informasi Akun"
          description="Identitas pengguna. Role bersifat tetap."
        >
          <Field label="Role">
            <div className="flex items-center gap-3">
              <UserRoleBadge role={user.role} />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Role tidak dapat diubah setelah akun dibuat.
              </span>
            </div>
          </Field>

          <Field
            label="Nama Lengkap"
            htmlFor="name"
            current={(form.watch("name") ?? "").length}
            max={100}
            error={errors.name?.message}
          >
            <Input
              id="name"
              maxLength={100}
              className="h-11 rounded-xl"
              disabled={busy}
              {...register("name")}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="email"
            current={(form.watch("email") ?? "").length}
            max={254}
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              maxLength={254}
              className="h-11 rounded-xl"
              autoComplete="off"
              disabled={busy}
              {...register("email")}
            />
          </Field>

          <Field
            label="Username"
            htmlFor="username"
            optional
            current={(form.watch("username") ?? "").length}
            max={15}
            error={errors.username?.message}
            hint="Huruf kecil, angka, titik, atau garis bawah (maks. 15 karakter)."
          >
            <Input
              id="username"
              maxLength={15}
              className="h-11 rounded-xl"
              placeholder="username"
              disabled={busy}
              {...register("username")}
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
              <>
                {user.nomorInduk ? (
                  <Field label="Nomor Induk">
                    <div className="flex items-center gap-2 rounded-xl bg-[color:var(--color-brand-50)] px-4 py-3 ring-1 ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/10 dark:ring-[color:var(--color-brand-500)]/30">
                      <code className="font-mono text-sm font-semibold tracking-wide text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-200)]">
                        {user.nomorInduk}
                      </code>
                    </div>
                  </Field>
                ) : null}
                <Field
                  label="Institusi"
                  htmlFor="institution"
                  optional
                  current={(form.watch("institution") ?? "").length}
                  max={150}
                  error={errors.institution?.message}
                >
                  <Input
                    id="institution"
                    placeholder="mis. Universitas Indonesia"
                    maxLength={150}
                    className="h-11 rounded-xl"
                    disabled={busy}
                    {...register("institution")}
                  />
                </Field>
              </>
            ) : null}

            {isMentor ? (
              <Field
                label="Jenis Kelamin"
                optional
                error={errors.gender?.message}
                hint="Dipakai untuk sapaan “Pak/Bu” di dashboard mentor."
              >
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <GenderRadio
                      value={field.value}
                      onChange={field.onChange}
                      disabled={busy}
                    />
                  )}
                />
              </Field>
            ) : null}
          </SectionCard>
        ) : null}

        <SectionCard
          icon={KeyRound}
          title="Keamanan"
          description="Pengelolaan password akun."
        >
          {needsClass ? (
            <Field
              label="Password Baru"
              htmlFor="newPassword"
              optional
              current={(form.watch("newPassword") ?? "").length}
              max={64}
              error={errors.newPassword?.message}
              hint="Kosongkan jika tidak ingin mengubah password (maks. 64 karakter)."
            >
              <PasswordInput
                id="newPassword"
                placeholder="Password baru"
                maxLength={64}
                autoComplete="new-password"
                disabled={busy}
                {...register("newPassword")}
              />
            </Field>
          ) : isStudent ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Demi keamanan, admin tidak menyimpan password Peserta Didik.
                Setel password sementara — pengguna wajib menggantinya saat login
                berikutnya.
              </p>
              {mustChange ? (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                  <ShieldCheck className="size-4 shrink-0" strokeWidth={2.2} />
                  Pengguna sedang diminta mengganti password saat login.
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="w-fit rounded-xl"
                disabled={busy}
                onClick={() => setTempDialogOpen(true)}
              >
                <KeyRound className="size-4" strokeWidth={2.2} />
                Set Password Sementara
              </Button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Password akun administrator dikelola lewat alur reset password
              mandiri (lupa password).
            </p>
          )}
        </SectionCard>

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
            {busy ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>

      {isStudent ? (
        <SetTempPasswordDialog
          open={tempDialogOpen}
          onOpenChange={setTempDialogOpen}
          userName={user.name}
          saving={tempPasswordMutation.isPending}
          onConfirm={handleSetTempPassword}
        />
      ) : null}
    </div>
  );
}
