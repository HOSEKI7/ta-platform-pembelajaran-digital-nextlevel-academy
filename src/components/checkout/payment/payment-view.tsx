"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  CancelPaymentButton,
  PendingCountdown,
} from "@/components/dashboard/transactions/transaction-detail-actions";
import { PriceBreakdown } from "@/components/checkout/price-breakdown";
import { useMidtransSnap } from "@/hooks/use-midtrans-snap";
import { useOrderStatusQuery } from "@/hooks/use-order-status";
import { paymentInstructionsFor } from "@/lib/payment-instructions";
import { paymentMethodById } from "@/lib/payment-methods";
import type { PaymentPageData } from "@/lib/payment-data-loader";
import { cn } from "@/lib/utils";

type Props = {
  data: PaymentPageData;
  clientKey: string;
  isProduction: boolean;
};

const primaryBtn = cn(
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
  "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
  "hover:bg-[color:var(--color-brand-600)] disabled:cursor-not-allowed disabled:opacity-70",
);

export function PaymentView({ data, clientKey, isProduction }: Props) {
  const router = useRouter();
  const { isReady, pay } = useMidtransSnap({ clientKey, isProduction });
  const { data: live } = useOrderStatusQuery(data.id, data.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const settledRef = useRef(false);

  const method = data.paymentMethod ? paymentMethodById(data.paymentMethod) : undefined;
  const instructions = paymentInstructionsFor(data.paymentMethod);
  const isSimulated = !data.paymentToken; // no Snap token → dev fallback

  // React to webhook-driven status changes detected by polling.
  useEffect(() => {
    const status = live?.status;
    if (!status || settledRef.current) return;
    if (status === "SUCCESS") {
      settledRef.current = true;
      toast.success("Pembayaran berhasil! Kursus sudah aktif.");
      router.replace(`/transactions/${data.id}`);
    } else if (status === "FAILED" || status === "EXPIRED") {
      settledRef.current = true;
      toast.error(
        status === "EXPIRED" ? "Pesanan kedaluwarsa." : "Pembayaran gagal.",
      );
      router.replace(`/transactions/${data.id}`);
    }
  }, [live?.status, data.id, router]);

  function handlePaySnap() {
    if (!data.paymentToken) return;
    pay(data.paymentToken, {
      onSuccess: () => {
        toast.success("Pembayaran berhasil! Kursus sudah aktif.");
        router.replace(`/transactions/${data.id}`);
      },
      onPending: () => {
        toast.info("Pembayaran sedang diproses. Kami akan memperbarui statusnya.");
      },
      onError: () => {
        toast.error("Pembayaran gagal. Silakan coba lagi.");
      },
      onClose: () => {
        toast.info("Jendela pembayaran ditutup. Selesaikan sebelum waktu habis.");
      },
    });
  }

  async function handleSimulate() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment/dev-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ orderId: data.id }),
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimulasikan pembayaran.");
      settledRef.current = true;
      toast.success("Pembayaran (simulasi) berhasil! Kursus sudah aktif.");
      router.replace(`/transactions/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <Link
        href="/transactions"
        className="mb-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Riwayat Transaksi
      </Link>

      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 shadow-[0_24px_60px_-34px_rgba(35,65,137,0.28)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-[color:var(--color-brand-50)]/50 px-6 py-5 sm:px-7">
          <div>
            <p className="font-heading text-lg font-extrabold tracking-tight text-zinc-900">
              Selesaikan Pembayaran
            </p>
            {data.invoiceNumber ? (
              <p className="mt-0.5 font-mono text-xs text-zinc-500">
                {data.invoiceNumber}
              </p>
            ) : null}
          </div>
          <PendingCountdown expiresAt={data.expiresAt} />
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-7">
          {/* Course */}
          <div className="flex gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-zinc-200">
              <Image
                src={data.course.thumbnailUrl}
                alt={data.course.title}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-brand-800)]">
                {data.course.categoryName}
              </span>
              <h3 className="mt-1.5 line-clamp-2 font-heading text-base font-bold leading-snug text-zinc-900">
                {data.course.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">oleh {data.course.instructor}</p>
            </div>
          </div>

          {/* Price */}
          <div className="rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-100">
            <PriceBreakdown
              originalPrice={data.pricing.originalPrice}
              discountAmount={data.pricing.discountAmount}
              voucherCode={data.voucher?.code ?? null}
            />
          </div>

          {/* Method + how-to-pay */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Metode Pembayaran
              </span>
              <span className="text-sm font-bold text-zinc-900">
                {method?.label ?? "Dipilih saat pembayaran"}
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-zinc-200 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <Sparkles className="size-4 text-[color:var(--color-brand-600)]" />
                {instructions.title}
              </p>
              <ol className="mt-3 space-y-2">
                {instructions.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-zinc-600">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-50)] text-[10px] font-bold text-[color:var(--color-brand-700)]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Pay action */}
          {isSimulated ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <span>
                  Mode pengembangan: gateway Midtrans belum dikonfigurasi. Gunakan
                  tombol di bawah untuk menyimulasikan pembayaran berhasil.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSimulate}
                disabled={isSubmitting}
                className={primaryBtn}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                ) : (
                  <CheckCircle2 className="size-4" strokeWidth={2.4} />
                )}
                Simulasikan Pembayaran (DEV)
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePaySnap}
              disabled={!isReady}
              className={primaryBtn}
            >
              {!isReady ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : (
                <Lock className="size-4" strokeWidth={2.4} />
              )}
              {isReady ? "Bayar Sekarang" : "Menyiapkan pembayaran…"}
            </button>
          )}

          {(live?.status ?? data.status) === "PENDING" ? (
            <CancelPaymentButton orderId={data.id} />
          ) : null}

          <p className="text-center text-[11px] leading-relaxed text-zinc-400">
            Pembayaran diproses dan dienkripsi oleh Midtrans. Tidak ada pengembalian
            dana setelah pembayaran berhasil dan kursus aktif. Salah pilih metode?
            Batalkan dan checkout ulang kapan saja.
          </p>
        </div>
      </section>
    </div>
  );
}
