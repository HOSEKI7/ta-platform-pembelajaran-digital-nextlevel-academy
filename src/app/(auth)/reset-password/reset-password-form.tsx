"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthPasswordInput } from "@/app/(auth)/_components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { resetPassword } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const initialError = params.get("error");

  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token || initialError) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-[color:var(--color-error)]">
          <ShieldAlert className="size-8" strokeWidth={2.2} />
        </div>
        <div className="space-y-2.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Link tidak valid.
          </h1>
          <p className="text-muted-foreground text-sm">
            Link reset password kamu sudah kedaluwarsa atau tidak dikenali.
            Mintalah link baru untuk melanjutkan.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className={buttonVariants({
            className:
              "bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] h-11 rounded-xl px-5 text-white",
          })}
        >
          Minta link reset baru
        </Link>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordInput) {
    const { error } = await resetPassword({
      newPassword: values.password,
      token: token!,
    });
    if (error) {
      toast.error(error.message ?? "Tidak dapat mengatur ulang password.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2200);
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" strokeWidth={2.2} />
        </div>
        <div className="space-y-2.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Password berhasil diubah.
          </h1>
          <p className="text-muted-foreground text-sm">
            Kamu akan diarahkan ke halaman masuk dalam beberapa detik...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-[1920px]:space-y-10">
      <header className="space-y-2 sm:space-y-2.5 min-[1920px]:space-y-3">
        <span className="text-[color:var(--color-brand-700)] inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] min-[1920px]:text-xs">
          Reset Password
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl min-[1920px]:text-[46px] min-[1920px]:leading-[1.05]">
          Buat password baru.
        </h1>
        <p className="text-muted-foreground text-sm min-[1920px]:text-base">
          Pilih password yang kuat dan belum pernah kamu pakai di tempat lain.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 min-[1920px]:space-y-6"
        noValidate
      >
        <AuthPasswordInput
          label="Password baru"
          autoComplete="new-password"
          placeholder="Min. 8 karakter, kombinasi huruf besar, kecil & angka"
          leadingIcon={<Lock />}
          error={errors.password?.message}
          hint="Min. 8 karakter — wajib mengandung huruf besar, huruf kecil, dan angka."
          {...register("password")}
        />
        <AuthPasswordInput
          label="Konfirmasi password baru"
          autoComplete="new-password"
          placeholder="Ulangi password baru kamu"
          leadingIcon={<Lock />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] group h-12 w-full rounded-xl text-[15px] font-semibold shadow-[0_8px_24px_-12px_var(--color-brand-500)] min-[1920px]:h-14 min-[1920px]:rounded-2xl min-[1920px]:text-base"
        >
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Simpan password baru
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
