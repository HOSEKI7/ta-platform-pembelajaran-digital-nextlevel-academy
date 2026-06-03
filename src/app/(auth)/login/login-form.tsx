"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthInput, AuthPasswordInput } from "@/app/(auth)/_components/form-field";
import { Button } from "@/components/ui/button";
import { signIn, sendVerificationEmail, getSession } from "@/lib/auth-client";
import { dashboardPathForRole } from "@/lib/role-routes";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // An explicit `?next=` (set by the proxy when bouncing an unauthenticated user
  // off a protected page) is honored as-is; otherwise we land the user on their
  // own role's dashboard rather than the student-only `/dashboard`.
  const explicitNext = params.get("next");

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setUnverifiedEmail(null);
    const { data, error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: explicitNext ?? "/dashboard",
    });

    if (error) {
      // PRD §6.1.2: if email not verified, show resend option.
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(values.email);
        toast.error(
          "Email kamu belum diverifikasi. Cek kotak masuk atau kirim ulang link verifikasi.",
        );
        return;
      }
      toast.error(error.message ?? "Email atau password salah.");
      return;
    }

    toast.success("Selamat datang kembali!");
    // Prefer the role from the sign-in response; fall back to a session read if
    // it isn't present so the redirect is always role-correct.
    let role = data?.user?.role;
    if (!role) {
      const session = await getSession();
      role = session.data?.user?.role;
    }
    router.push(explicitNext ?? dashboardPathForRole(role));
    router.refresh();
  }

  async function handleResendVerification() {
    if (!unverifiedEmail) return;
    const { error } = await sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/verify-email?status=success",
    });
    if (error) {
      toast.error(error.message ?? "Gagal mengirim link verifikasi.");
      return;
    }
    toast.success("Link verifikasi sudah dikirim ulang. Cek email kamu.");
  }

  return (
    <div className="space-y-8 min-[1920px]:space-y-10">
      <header className="space-y-2.5 min-[1920px]:space-y-3">
        <span className="text-[color:var(--color-brand-700)] inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] min-[1920px]:text-xs">
          Masuk Akun
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl min-[1920px]:text-[46px] min-[1920px]:leading-[1.05]">
          Selamat datang kembali.
        </h1>
        <p className="text-muted-foreground text-sm min-[1920px]:text-base">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-[color:var(--color-brand-700)] font-medium hover:underline"
          >
            Daftar sekarang
          </Link>
          .
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
        <AuthPasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Masukkan password kamu"
          leadingIcon={<Lock />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-sm min-[1920px]:text-[15px]">
          <span />
          <Link
            href="/forgot-password"
            className="text-[color:var(--color-brand-700)] font-medium hover:underline"
          >
            Lupa password?
          </Link>
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
              Masuk
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      {unverifiedEmail ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-medium text-amber-900">Verifikasi email diperlukan</p>
          <p className="mt-1 text-amber-800/80">
            Kami sudah mengirim link verifikasi ke <strong>{unverifiedEmail}</strong>.
            Tidak menerima email?
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            className="mt-2 text-sm font-semibold text-amber-900 underline decoration-amber-400 underline-offset-4 hover:decoration-amber-700"
          >
            Kirim ulang link verifikasi
          </button>
        </div>
      ) : null}
    </div>
  );
}
