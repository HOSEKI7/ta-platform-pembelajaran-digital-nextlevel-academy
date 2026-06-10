"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthInput } from "@/app/(auth)/_components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    // Per Better Auth: always return success-like UX even if email not found,
    // to avoid leaking which addresses are registered.
    const { error } = await requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });
    if (error) {
      toast.error(error.message ?? "Tidak dapat memproses permintaan. Coba lagi.");
      return;
    }
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] mx-auto grid size-16 place-items-center rounded-2xl">
          <MailCheck className="size-8" strokeWidth={2.2} />
        </div>
        <div className="space-y-2.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Periksa kotak masuk kamu.
          </h1>
          <p className="text-muted-foreground text-sm">
            Jika <strong className="text-foreground">{sentTo}</strong> terdaftar di
            sistem kami, kamu akan menerima link reset password dalam beberapa menit.
          </p>
          <p className="text-muted-foreground text-xs">
            Link reset password berlaku selama 1 jam dan hanya bisa dipakai sekali.
          </p>
        </div>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "ghost",
            className:
              "text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] h-11 rounded-xl",
          })}
        >
          <ArrowLeft className="size-4" />
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-[1920px]:space-y-10">
      <header className="space-y-2 sm:space-y-2.5 min-[1920px]:space-y-3">
        <span className="text-[color:var(--color-brand-700)] inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] min-[1920px]:text-xs">
          Lupa Password
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl min-[1920px]:text-[46px] min-[1920px]:leading-[1.05]">
          Atur ulang password kamu.
        </h1>
        <p className="text-muted-foreground text-sm min-[1920px]:text-base">
          Masukkan email yang terdaftar. Kami akan kirim link reset password yang
          berlaku selama 1 jam.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 min-[1920px]:space-y-6"
        noValidate
      >
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          leadingIcon={<Mail />}
          error={errors.email?.message}
          {...register("email")}
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
              Kirim link reset
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm min-[1920px]:text-base">
        Sudah ingat passwordnya?{" "}
        <Link
          href="/login"
          className="text-[color:var(--color-brand-700)] font-medium hover:underline"
        >
          Kembali ke masuk
        </Link>
      </p>
    </div>
  );
}
