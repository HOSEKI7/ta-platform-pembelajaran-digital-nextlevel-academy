"use client";

import { CheckCircle2, MailQuestion, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";

type View = "success" | "invalid" | "expired" | "pending";

export function VerifyEmailStatus() {
  const params = useSearchParams();

  // After Better Auth's /api/auth/verify-email runs, it redirects to the
  // configured callbackURL with `?status=success` (or `?error=...` on failure).
  const status = params.get("status");
  const error = params.get("error");
  const email = params.get("email");

  const view: View = (() => {
    if (status === "success") return "success";
    if (error === "token_expired" || error === "EXPIRED_TOKEN") return "expired";
    if (error) return "invalid";
    return "pending";
  })();

  if (view === "success") return <SuccessView />;
  if (view === "expired") return <ExpiredView prefillEmail={email} />;
  if (view === "invalid") return <InvalidView prefillEmail={email} />;
  return <PendingView prefillEmail={email} />;
}

function SuccessView() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-8" strokeWidth={2.2} />
      </div>
      <div className="space-y-2.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Email berhasil diverifikasi.
        </h1>
        <p className="text-muted-foreground text-sm">
          Akun NextLevel Academy kamu sekarang aktif. Silakan masuk untuk mulai
          belajar.
        </p>
      </div>
      <Link
        href="/login"
        className={buttonVariants({
          className:
            "bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] h-11 rounded-xl px-5 text-white",
        })}
      >
        Masuk sekarang
      </Link>
    </div>
  );
}

function ExpiredView({ prefillEmail }: { prefillEmail: string | null }) {
  return (
    <ProblemCard
      icon={<MailQuestion className="size-8" strokeWidth={2.2} />}
      heading="Link verifikasi kedaluwarsa."
      body="Untuk alasan keamanan, link verifikasi hanya berlaku terbatas. Kirim ulang link baru di bawah ini."
      prefillEmail={prefillEmail}
    />
  );
}

function InvalidView({ prefillEmail }: { prefillEmail: string | null }) {
  return (
    <ProblemCard
      icon={<ShieldAlert className="size-8" strokeWidth={2.2} />}
      heading="Link verifikasi tidak valid."
      body="Link yang kamu klik tidak dikenali. Mungkin sudah pernah dipakai. Kirim ulang link verifikasi yang baru."
      prefillEmail={prefillEmail}
    />
  );
}

function PendingView({ prefillEmail }: { prefillEmail: string | null }) {
  return (
    <ProblemCard
      icon={<MailQuestion className="size-8" strokeWidth={2.2} />}
      heading="Tunggu, verifikasi email kamu."
      body="Sudah daftar tapi belum dapat link verifikasi? Masukkan email kamu untuk mengirim ulang."
      prefillEmail={prefillEmail}
    />
  );
}

function ProblemCard({
  icon,
  heading,
  body,
  prefillEmail,
}: {
  icon: React.ReactNode;
  heading: string;
  body: string;
  prefillEmail: string | null;
}) {
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [busy, setBusy] = useState(false);

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Masukkan email kamu dulu.");
      return;
    }
    setBusy(true);
    const { error } = await sendVerificationEmail({
      email: email.trim(),
      callbackURL: "/verify-email?status=success",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message ?? "Gagal mengirim ulang. Coba lagi sebentar.");
      return;
    }
    toast.success("Link verifikasi baru sudah dikirim. Cek email kamu.");
  }

  return (
    <div className="space-y-6 text-center">
      <div className="bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] mx-auto grid size-16 place-items-center rounded-2xl">
        {icon}
      </div>
      <div className="space-y-2.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground text-sm">{body}</p>
      </div>
      <div className="space-y-3 text-left">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-[color:var(--color-brand-100)] focus-visible:border-[color:var(--color-brand-400)] focus-visible:ring-[color:var(--color-brand-200)] h-11 w-full rounded-xl border bg-white px-4 text-[15px] outline-none focus-visible:ring-4"
        />
        <Button
          type="button"
          onClick={handleResend}
          disabled={busy}
          className="bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] h-11 w-full rounded-xl"
        >
          {busy ? "Mengirim..." : "Kirim ulang link verifikasi"}
        </Button>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "ghost",
            className:
              "text-[color:var(--color-brand-700)] hover:text-[color:var(--color-brand-800)] h-11 w-full rounded-xl",
          })}
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
