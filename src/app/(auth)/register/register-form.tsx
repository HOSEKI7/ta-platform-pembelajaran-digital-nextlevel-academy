"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthInput, AuthPasswordInput } from "@/app/(auth)/_components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { sendVerificationEmail, signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

export function RegisterForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  const agreed = watch("agreedToTerms");

  async function onSubmit(values: RegisterInput) {
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/verify-email?status=success",
    });

    if (error) {
      // The sign-up before-hook (auth.ts) throws USER_ALREADY_EXISTS for a
      // duplicate email so we can show an explicit message here.
      if (error.code === "USER_ALREADY_EXISTS") {
        toast.error("Email ini sudah terdaftar. Coba masuk atau pakai email lain.");
        return;
      }
      toast.error(error.message ?? "Gagal membuat akun. Silakan coba lagi.");
      return;
    }

    setSubmittedEmail(values.email);
    toast.success("Akun dibuat. Cek email kamu untuk verifikasi.");
  }

  if (submittedEmail) {
    return <PostRegisterCard email={submittedEmail} />;
  }

  return (
    <div className="space-y-5 sm:space-y-6 min-[1920px]:space-y-9">
      <header className="space-y-2 sm:space-y-2.5 min-[1920px]:space-y-3">
        <span className="text-[color:var(--color-brand-700)] inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] min-[1920px]:text-xs">
          Daftar Akun Baru
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl min-[1920px]:text-[46px] min-[1920px]:leading-[1.05]">
          Mulai perjalanan belajar kamu.
        </h1>
        <p className="text-muted-foreground text-sm min-[1920px]:text-base">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-[color:var(--color-brand-700)] font-medium hover:underline"
          >
            Masuk
          </Link>
          .
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3.5 sm:space-y-4 xl:space-y-5 min-[1920px]:space-y-6"
        noValidate
      >
        <AuthInput
          label="Nama lengkap"
          autoComplete="name"
          placeholder="Contoh: Rafi Pratama"
          leadingIcon={<User />}
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          leadingIcon={<Mail />}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthPasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="Min. 8 karakter, kombinasi huruf besar, kecil & angka"
          leadingIcon={<Lock />}
          error={errors.password?.message}
          hint="Min. 8 karakter — wajib mengandung huruf besar, huruf kecil, dan angka."
          {...register("password")}
        />
        <AuthPasswordInput
          label="Konfirmasi password"
          autoComplete="new-password"
          placeholder="Ulangi password kamu"
          leadingIcon={<Lock />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="space-y-1.5">
          <label className="flex items-start gap-3 text-sm min-[1920px]:gap-3.5 min-[1920px]:text-[15px]">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) =>
                setValue("agreedToTerms", checked === true, { shouldValidate: true })
              }
              className="data-[state=checked]:bg-[color:var(--color-brand-600)] data-[state=checked]:border-[color:var(--color-brand-600)] mt-0.5 size-4 rounded-md min-[1920px]:size-[18px]"
            />
            <Label
              htmlFor="terms"
              className="text-foreground/80 cursor-pointer font-normal leading-relaxed"
            >
              Saya menyetujui{" "}
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] font-medium underline underline-offset-4"
              >
                Kebijakan Privasi
              </a>{" "}
              dan{" "}
              <a
                href="/legal/terms"
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] font-medium underline underline-offset-4"
              >
                Syarat & Ketentuan
              </a>{" "}
              NextLevel Academy.
            </Label>
          </label>
          {errors.agreedToTerms ? (
            <p className="text-[color:var(--color-error)] text-xs">
              {errors.agreedToTerms.message}
            </p>
          ) : null}
        </div>

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
              Buat akun
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function PostRegisterCard({ email }: { email: string }) {
  async function handleResend() {
    const { error } = await sendVerificationEmail({
      email,
      callbackURL: "/verify-email?status=success",
    });
    if (error) {
      toast.error(error.message ?? "Gagal mengirim ulang.");
      return;
    }
    toast.success("Link verifikasi sudah dikirim ulang.");
  }

  return (
    <div className="space-y-6 text-center">
      <div className="bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] mx-auto grid size-16 place-items-center rounded-2xl">
        <CheckCircle2 className="size-8" strokeWidth={2.2} />
      </div>
      <div className="space-y-2.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Cek email kamu.
        </h1>
        <p className="text-muted-foreground text-sm">
          Kami sudah mengirim link verifikasi ke
          <br />
          <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-muted-foreground text-xs">
          Klik link di email untuk mengaktifkan akun, lalu kembali untuk masuk.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          onClick={handleResend}
          variant="outline"
          className="h-11 rounded-xl"
        >
          Kirim ulang link verifikasi
        </Button>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "ghost",
            className:
              "text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] h-11 rounded-xl",
          })}
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
