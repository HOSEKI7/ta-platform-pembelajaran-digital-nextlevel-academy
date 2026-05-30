"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { signOut } from "@/lib/auth-client";
import {
  forcePasswordChangeSchema,
  type ForcePasswordChangeInput,
} from "@/lib/validations/admin-user";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/courses/form/field";
import { PasswordInput } from "@/components/admin/users/form/password-input";

/**
 * Shown to a user who logged in with an admin-issued temporary password
 * (`mustChangePassword=true`). On success the server clears the flag and revokes
 * all sessions, so we sign out and send the user to /login to sign in fresh with
 * their new password (a fresh session reads the cleared flag → no redirect loop).
 */
export function ForcePasswordChangeForm({ userName }: { userName: string }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForcePasswordChangeInput>({
    resolver: zodResolver(forcePasswordChangeSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/force-password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "Gagal mengganti password.");
      }
      toast.success("Password berhasil diubah. Silakan login kembali.");
      await signOut();
      window.location.assign("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengganti password.");
      setSubmitting(false);
    }
  });

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-zinc-900/5 ring-1 ring-zinc-200">
      <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
        <ShieldCheck className="size-6" strokeWidth={2.2} />
      </span>
      <h1 className="mt-4 font-heading text-xl font-bold text-zinc-900">
        Ganti Password Anda
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        Hai {userName}, akun Anda menggunakan password sementara dari admin. Buat
        password baru untuk melanjutkan.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
        <Field
          label="Password Baru"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
          hint="Minimal 8 karakter dengan huruf besar, kecil, dan angka."
        >
          <PasswordInput
            id="newPassword"
            placeholder="Password baru"
            autoComplete="new-password"
            disabled={submitting}
            {...register("newPassword")}
          />
        </Field>

        <Field
          label="Konfirmasi Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            placeholder="Ulangi password baru"
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
          {submitting ? "Menyimpan…" : "Simpan & Lanjutkan"}
        </Button>
      </form>
    </div>
  );
}
