import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { peekAdminInvite, type AdminInvitePeekStatus } from "@/lib/admin-accounts-loader";

import { ForceLightTheme } from "@/app/(auth)/_components/force-light-theme";
import { AcceptInviteForm } from "@/components/admin-invite/accept-invite-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terima Undangan Administrator",
  robots: { index: false, follow: false },
};

const INVALID_COPY: Record<
  Exclude<AdminInvitePeekStatus, "valid">,
  { title: string; body: string }
> = {
  invalid: {
    title: "Undangan tidak valid",
    body: "Tautan undangan tidak ditemukan atau sudah tidak berlaku. Minta administrator mengirim ulang undangan.",
  },
  expired: {
    title: "Undangan kedaluwarsa",
    body: "Tautan undangan ini sudah melewati batas waktu 24 jam. Minta administrator mengirim undangan baru.",
  },
  used: {
    title: "Undangan sudah digunakan",
    body: "Akun untuk undangan ini sudah dibuat. Silakan masuk dengan akun Anda.",
  },
  revoked: {
    title: "Undangan dibatalkan",
    body: "Undangan ini telah dibatalkan oleh administrator. Hubungi administrator bila Anda merasa ini keliru.",
  },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function AcceptAdminInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const peek = await peekAdminInvite(token ?? "");

  return (
    <>
      <ForceLightTheme />
      <main className="auth-light-scope grid min-h-screen place-items-center bg-zinc-50 px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <Link
            href="/"
            aria-label="NextLevel Academy beranda"
            className="inline-flex"
          >
            <Image
              src="/nla-horizontal-logo.webp"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              className="h-11 w-auto"
            />
          </Link>

          {peek.status === "valid" ? (
            <AcceptInviteForm
              token={token ?? ""}
              email={peek.email ?? ""}
              suggestedName={peek.name ?? ""}
            />
          ) : (
            <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-xl shadow-zinc-900/5 ring-1 ring-zinc-200">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <ShieldX className="size-6" strokeWidth={2.2} />
              </span>
              <h1 className="mt-4 font-heading text-xl font-bold text-zinc-900">
                {INVALID_COPY[peek.status].title}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                {INVALID_COPY[peek.status].body}
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--color-brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-700)]"
              >
                Ke Halaman Masuk
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
