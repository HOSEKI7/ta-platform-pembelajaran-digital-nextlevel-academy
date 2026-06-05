"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  acceptInviteFormSchema,
  type AcceptInviteFormInput,
} from "@/lib/validations/admin-invite";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/courses/form/field";
import { PasswordInput } from "@/components/admin/users/form/password-input";

type Props = {
  token: string;
  email: string;
  suggestedName: string;
};

export function AcceptInviteForm({ token, email, suggestedName }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormInput>({
    resolver: zodResolver(acceptInviteFormSchema),
    defaultValues: { name: suggestedName, password: "", confirmPassword: "" },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin-invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...values }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "Gagal menyelesaikan undangan.");
      }
      toast.success("Akun administrator berhasil dibuat. Silakan login.");
      window.location.assign("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyelesaikan undangan.");
      setSubmitting(false);
    }
  });

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-zinc-900/5 ring-1 ring-zinc-200">
      <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
        <ShieldCheck className="size-6" strokeWidth={2.2} />
      </span>
      <h1 className="mt-4 font-heading text-xl font-bold text-zinc-900">
        Terima Undangan Administrator
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        Anda diundang sebagai administrator untuk{" "}
        <span className="font-semibold text-zinc-700">{email}</span>. Lengkapi
        data berikut untuk mengaktifkan akun Anda.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
        <Field label="Nama Lengkap" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Nama Anda"
            className="h-11 rounded-xl"
            autoComplete="name"
            disabled={submitting}
            {...register("name")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="Minimal 8 karakter dengan huruf besar, kecil, dan angka."
        >
          <PasswordInput
            id="password"
            placeholder="Buat password"
            autoComplete="new-password"
            disabled={submitting}
            {...register("password")}
          />
        </Field>

        <Field
          label="Konfirmasi Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            placeholder="Ulangi password"
            autoComplete="new-password"
            disabled={submitting}
            {...register("confirmPassword")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
          ) : null}
          {submitting ? "Memproses…" : "Aktifkan Akun"}
        </Button>
      </form>
    </div>
  );
}
