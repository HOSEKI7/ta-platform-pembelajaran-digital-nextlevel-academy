"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { BuyerInfoCard } from "@/components/checkout/buyer-info-card";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { PaymentDetailsCard } from "@/components/checkout/payment-details-card";
import { PriceBreakdown } from "@/components/checkout/price-breakdown";
import { Checkbox } from "@/components/ui/checkbox";
import { PendingCountdown } from "@/components/dashboard/transactions/transaction-detail-actions";
import {
  CreateOrderError,
  useCreateOrder,
  useValidateVoucher,
  type AppliedVoucher,
} from "@/hooks/use-checkout";
import type { CheckoutCourse, ResumeOrder } from "@/lib/checkout-data-loader";
import { useMidtransSnap } from "@/hooks/use-midtrans-snap";
import { isValidOptionalPhone } from "@/lib/validators/phone";
import { cn } from "@/lib/utils";

type Props = {
  course: CheckoutCourse;
  clientKey: string;
  isProduction: boolean;
  customer: { name: string; email: string };
  /** Present when resuming a live PENDING order (reopen Snap, locked summary). */
  resume?: ResumeOrder | null;
  /** Prefill for the phone field (fresh checkout only). */
  lastPhone?: string | null;
};

const primaryBtn = cn(
  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition",
  "bg-[color:var(--color-brand-500)] shadow-[0_18px_36px_-16px_rgba(71,142,244,0.8)] hover:bg-[color:var(--color-brand-600)]",
  "disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none",
);

export function CheckoutForm({
  course,
  clientKey,
  isProduction,
  customer,
  resume,
  lastPhone,
}: Props) {
  const router = useRouter();
  const { isReady, pay } = useMidtransSnap({ clientKey, isProduction });
  const settledRef = useRef(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);
  const snapOpenedAt = useRef(0);

  // Fresh-checkout state.
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validateVoucher = useValidateVoucher();
  const createOrder = useCreateOrder();

  // When a client key is configured, Snap is needed — wait until snap.js loads
  // before letting the user create an order that opens the popup. Dev fallback
  // (empty key) uses the simulate endpoint, so it never waits.
  const snapNeeded = clientKey !== "";

  function goToTransaction(orderId: string) {
    if (settledRef.current) return;
    settledRef.current = true;
    router.push(`/transactions/${orderId}`);
  }

  /** Opens the Snap popup; every callback only hints the UI — truth is in the DB. */
  function openSnap(token: string, orderId: string) {
    setSnapError(null);
    snapOpenedAt.current = Date.now();
    const CSP_TIMEOUT_MS = 4000;
    let cspTimer: ReturnType<typeof setTimeout> | undefined;
    // If onClose fires too fast, likely CSP/ad-blocker blocked the popup content.
    const onClose = () => {
      clearTimeout(cspTimer);
      if (Date.now() - snapOpenedAt.current < CSP_TIMEOUT_MS) {
        setSnapError(
          "Ekstensi pemblokir iklan (seperti uBlock Origin atau Brave " +
            "Shields) menghentikan jendela pembayaran. Nonaktifkan ekstensi " +
            "untuk halaman ini atau gunakan jendela incognito, lalu coba lagi.",
        );
      } else {
        goToTransaction(orderId);
      }
    };
    pay(token, {
      onSuccess: () => {
        clearTimeout(cspTimer);
        goToTransaction(orderId);
      },
      onPending: () => {
        clearTimeout(cspTimer);
        goToTransaction(orderId);
      },
      onClose,
      onError: () => {
        clearTimeout(cspTimer);
        setSnapError(
          "Pembayaran gagal. Ekstensi pemblokir iklan (seperti uBlock Origin " +
            "atau Brave Shields) dapat menghentikan jendela pembayaran Midtrans. " +
            "Nonaktifkan ekstensi untuk halaman ini atau gunakan jendela incognito.",
        );
      },
    });
    // Guard: if no callback fired within CSP_TIMEOUT_MS, likely popup silently
    // failed (e.g. CSP on the iframe itself without an error callback).
    cspTimer = setTimeout(() => {
      // onClose/onError already cleared; snapOpenedAt still > 0 if nothing fired.
      if (snapOpenedAt.current > 0) {
        setSnapError(
          "Jendela pembayaran tidak muncul. Nonaktifkan ekstensi pemblokir " +
            "iklan (uBlock Origin, Brave Shields) atau gunakan jendela " +
            "incognito, lalu coba lagi.",
        );
      }
    }, CSP_TIMEOUT_MS);
  }

  /** Dev fallback when Midtrans isn't configured. */
  async function simulate(orderId: string) {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/payment/dev-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ orderId }),
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimulasikan pembayaran.");
      toast.success("Pembayaran (simulasi) berhasil! Kursus sudah aktif.");
      goToTransaction(orderId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSimulating(false);
    }
  }

  const handleApplyVoucher = (code: string) => {
    setVoucherError(null);
    validateVoucher.mutate(
      { code, courseId: course.id },
      {
        onSuccess: (data) => setAppliedVoucher(data),
        onError: (err) => setVoucherError(err.message),
      },
    );
  };

  const handleSubmit = () => {
    if (!agreedToTerms) return;
    if (!isValidOptionalPhone(phone)) {
      setPhoneError("Nomor telepon tidak valid.");
      return;
    }
    setPhoneError(null);
    setSubmitError(null);
    createOrder.mutate(
      {
        courseId: course.id,
        voucherCode: appliedVoucher?.code,
        customerPhone: phone || undefined,
        agreedToTerms,
      },
      {
        onSuccess: (data) => {
          if (data.status === "SUCCESS" && data.slug) {
            settledRef.current = true;
            router.push(`/learn/${data.slug}`);
            return;
          }
          if (data.simulated) {
            void simulate(data.orderId);
            return;
          }
          if (data.paymentToken) openSnap(data.paymentToken, data.orderId);
        },
        onError: (err) => {
          // A live PENDING order already exists — refresh into resume mode.
          if (err instanceof CreateOrderError && err.resumeOrderId) {
            router.refresh();
            return;
          }
          setSubmitError(err.message);
        },
      },
    );
  };

  /* ----------------------------- Resume mode ----------------------------- */
  if (resume) {
    const resumeSimulated = !resume.paymentToken;
    const handleResume = () => {
      if (resumeSimulated) {
        void simulate(resume.orderId);
      } else if (resume.paymentToken) {
        openSnap(resume.paymentToken, resume.orderId);
      }
    };
    const busy = isSimulating || (snapNeeded && !isReady);

    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8 lg:px-10">
        <div className="flex flex-col gap-6">
          <OrderSummaryCard course={course} />
          <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_20px_50px_-30px_rgba(35,65,137,0.18)] sm:p-7">
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-zinc-900">
              Detail Pembayaran
            </h2>
            <div className="mt-5 border-t border-zinc-200 pt-5">
              <PriceBreakdown
                originalPrice={resume.pricing.originalPrice}
                discountAmount={resume.pricing.discountAmount}
                voucherCode={resume.voucher?.code ?? null}
              />
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_24px_60px_-32px_rgba(35,65,137,0.25)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-extrabold tracking-tight text-zinc-900">
                Lanjutkan Pembayaran
              </h2>
              <PendingCountdown
                expiresAt={resume.expiresAt}
                onExpire={() => router.refresh()}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Kamu punya pesanan yang belum dibayar. Buka kembali jendela
              pembayaran untuk menyelesaikannya sebelum waktu habis.
            </p>

            <button
              type="button"
              onClick={handleResume}
              disabled={busy}
              className={cn(primaryBtn, "mt-5")}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : (
                <Lock className="size-4" strokeWidth={2.4} />
              )}
              {snapNeeded && !isReady
                ? "Menyiapkan pembayaran…"
                : "Bayar Sekarang"}
            </button>

            {snapError ? (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-[color:var(--color-error)]/8 px-3.5 py-2.5 text-xs font-medium text-[color:var(--color-error)] ring-1 ring-[color:var(--color-error)]/20"
              >
                {snapError}
              </p>
            ) : null}

            <Link
              href={`/transactions/${resume.orderId}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)]"
            >
              <ArrowLeft className="size-3.5" strokeWidth={2.4} />
              Lihat detail transaksi
            </Link>
          </section>
        </div>
      </div>
    );
  }

  /* ------------------------------ Fresh mode ----------------------------- */
  const canSubmit =
    agreedToTerms && !createOrder.isPending && !isSimulating && (!snapNeeded || isReady);
  const submitting = createOrder.isPending || isSimulating;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8 lg:px-10">
      <div className="flex flex-col gap-6">
        <OrderSummaryCard course={course} />
        <PaymentDetailsCard
          originalPrice={course.price}
          appliedVoucher={appliedVoucher}
          voucherError={voucherError}
          isApplying={validateVoucher.isPending}
          onApplyVoucher={handleApplyVoucher}
          onClearVoucher={() => {
            setAppliedVoucher(null);
            setVoucherError(null);
          }}
        />
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <BuyerInfoCard
          name={customer.name}
          email={customer.email}
          initialPhone={lastPhone}
          onPhoneChange={(v) => {
            setPhone(v);
            if (phoneError) setPhoneError(null);
          }}
          phoneError={phoneError}
        />

        <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_24px_60px_-32px_rgba(35,65,137,0.25)] sm:p-7">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
            <Checkbox
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              className="mt-0.5"
            />
            <span className="leading-snug">
              Saya menyetujui{" "}
              <Link
                href="/legal/terms"
                className="font-semibold text-[color:var(--color-brand-700)] underline underline-offset-4"
              >
                Syarat &amp; Ketentuan
              </Link>{" "}
              dan{" "}
              <Link
                href="#"
                className="font-semibold text-[color:var(--color-brand-700)] underline underline-offset-4"
              >
                Kebijakan Tanpa Refund
              </Link>
              .
            </span>
          </label>

          {submitError || snapError ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-[color:var(--color-error)]/8 px-3.5 py-2.5 text-xs font-medium text-[color:var(--color-error)] ring-1 ring-[color:var(--color-error)]/20"
            >
              {snapError ?? submitError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(primaryBtn, "mt-5")}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <Lock className="size-4" strokeWidth={2.4} />
            )}
            {submitting
              ? "Memproses pesanan…"
              : snapNeeded && !isReady
                ? "Menyiapkan pembayaran…"
                : "Checkout & Bayar Sekarang"}
          </button>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-500">
            Metode pembayaran dipilih di jendela Midtrans. Pembelian bersifat
            final — tidak ada pengembalian dana setelah kursus aktif.
          </p>
          <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-400">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[color:var(--color-success)]" />
            Transaksi diproses &amp; dienkripsi oleh Midtrans. Data pembayaranmu
            tidak pernah disimpan di server NextLevel Academy.
          </p>
        </section>
      </div>
    </div>
  );
}
