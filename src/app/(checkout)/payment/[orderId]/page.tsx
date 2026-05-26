import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { env } from "@/lib/env";
import { loadPaymentPageData } from "@/lib/payment-data-loader";
import { PaymentView } from "@/components/checkout/payment/payment-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembayaran",
  description: "Selesaikan pembayaran kursus NextLevel Academy.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderId: string }>;

export default async function PaymentPage({ params }: { params: Params }) {
  const { orderId } = await params;
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: `/payment/${orderId}`,
  });

  const data = await loadPaymentPageData(session.user.id, orderId);
  if (!data) notFound();

  // Already paid — show the confirmation/invoice instead.
  if (data.status === "SUCCESS") redirect(`/transactions/${data.id}`);

  // Terminal or timed-out — no payment session to resume.
  if (data.isExpired) return <TerminalCard status="EXPIRED" />;
  if (data.status === "FAILED" || data.status === "EXPIRED") {
    return <TerminalCard status={data.status} />;
  }

  return (
    <PaymentView
      data={data}
      clientKey={env.midtrans.clientKey() ?? ""}
      isProduction={env.midtrans.isProduction()}
    />
  );
}

function TerminalCard({ status }: { status: "FAILED" | "EXPIRED" }) {
  const copy =
    status === "EXPIRED"
      ? "Pesanan kedaluwarsa karena melewati batas waktu pembayaran 60 menit."
      : "Pembayaran gagal diproses dan tidak ada biaya yang ditagihkan.";
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <section className="rounded-3xl bg-white p-8 text-center ring-1 ring-zinc-200">
        <h1 className="font-heading text-xl font-extrabold text-zinc-900">
          {status === "EXPIRED" ? "Pesanan Kedaluwarsa" : "Pembayaran Gagal"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
          {copy} Kamu bisa membeli kembali kursus ini kapan saja dari halaman kursus.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/transactions"
            className="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold text-white transition bg-[color:var(--color-brand-500)] hover:bg-[color:var(--color-brand-600)]"
          >
            Lihat Riwayat Transaksi
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
