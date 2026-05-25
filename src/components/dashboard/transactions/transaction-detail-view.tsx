import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Hash,
  PlayCircle,
  ReceiptText,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import type { TransactionDetailDTO } from "@/lib/transaction-data-loader";
import { formatDateID, formatTimeID } from "@/lib/format-date";
import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { STATUS_META, StatusBadge } from "./transaction-status";
import {
  ContinuePaymentButton,
  CopyButton,
  DownloadReceiptButton,
  PendingCountdown,
} from "./transaction-detail-actions";

type Props = {
  tx: TransactionDetailDTO;
};

function dt(iso: string): string {
  return `${formatDateID(iso)} · ${formatTimeID(iso)} WIB`;
}

const cardBase =
  "rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]";

const sectionLabel =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500";

export function TransactionDetailView({ tx }: Props) {
  const meta = STATUS_META[tx.status];
  const hasDiscount = tx.pricing.discountAmount > 0;

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-50 duration-500">
      <Link
        href="/transactions"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Transaksi
      </Link>

      {/* Hero */}
      <section className={cn("relative overflow-hidden", cardBase)}>
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r",
            meta.accent,
          )}
        />
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
                Detail Transaksi
              </p>
              <h1 className="mt-1.5 font-heading text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {tx.course.title}
              </h1>
            </div>
            <StatusBadge status={tx.status} size="lg" />
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:gap-10 dark:border-[color:var(--color-surface-border)]">
            <div className="min-w-0">
              <p className={sectionLabel}>ID Transaksi</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="truncate font-mono text-sm text-zinc-800 dark:text-zinc-200"
                  title={tx.id}
                >
                  {tx.id}
                </span>
                <CopyButton value={tx.id} label="ID transaksi disalin." />
              </div>
            </div>
            <div>
              <p className={sectionLabel}>Waktu Checkout</p>
              <p className="mt-1.5 text-sm text-zinc-800 dark:text-zinc-200">
                {dt(tx.checkoutAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: payment breakdown + metadata */}
        <div className="flex flex-col gap-6">
          <section className={cn(cardBase, "p-6 sm:p-7")}>
            <div className="flex items-center gap-2">
              <ReceiptText
                className="size-4 text-[color:var(--color-brand-600)]"
                strokeWidth={2.4}
              />
              <h2 className={sectionLabel}>Rincian Pembayaran</h2>
            </div>

            <dl className="mt-5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">Harga Asli</dt>
                <dd className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {idr.format(tx.pricing.originalPrice)}
                </dd>
              </div>

              {hasDiscount ? (
                <div className="flex items-center justify-between text-sm">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    Diskon
                    {tx.voucher ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                        <Ticket className="size-3" strokeWidth={2.4} />
                        {tx.voucher.code} · {tx.voucher.discountPct}%
                      </span>
                    ) : null}
                  </dt>
                  <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                    − {idr.format(tx.pricing.discountAmount)}
                  </dd>
                </div>
              ) : null}

              <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-[color:var(--color-surface-border)]">
                <dt className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {tx.status === "SUCCESS" ? "Total Dibayar" : "Total Tagihan"}
                </dt>
                <dd className="font-heading text-2xl font-extrabold text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
                  {idr.format(tx.pricing.finalPrice)}
                </dd>
              </div>
            </dl>
          </section>

          <section className={cn(cardBase, "p-6 sm:p-7")}>
            <div className="flex items-center gap-2">
              <CreditCard
                className="size-4 text-[color:var(--color-brand-600)]"
                strokeWidth={2.4}
              />
              <h2 className={sectionLabel}>Informasi Pembayaran</h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field icon={CreditCard} label="Metode Pembayaran">
                {tx.paymentMethod ?? "—"}
              </Field>

              <Field icon={Hash} label="ID Invoice">
                {tx.paymentInvoiceId ? (
                  <span className="flex items-center gap-2">
                    <span className="truncate font-mono text-[13px]">
                      {tx.paymentInvoiceId}
                    </span>
                    <CopyButton
                      value={tx.paymentInvoiceId}
                      label="ID invoice disalin."
                    />
                  </span>
                ) : (
                  <span className="text-zinc-400">Belum tersedia</span>
                )}
              </Field>

              <Field icon={CalendarClock} label="Tanggal Checkout">
                {dt(tx.checkoutAt)}
              </Field>

              <Field icon={BadgeCheck} label="Tanggal Dibayar">
                {tx.paidAt ? (
                  dt(tx.paidAt)
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </Field>

              <Field icon={CalendarClock} label="Batas Waktu">
                {dt(tx.expiresAt)}
              </Field>

              <Field icon={ShieldCheck} label="Status">
                <StatusBadge status={tx.status} />
              </Field>
            </div>
          </section>
        </div>

        {/* Right: course + status-aware action */}
        <div className="flex flex-col gap-6">
          <section className={cn("overflow-hidden", cardBase)}>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={tx.course.thumbnailUrl}
                alt={tx.course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
                unoptimized
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brand-800)] ring-1 ring-white/60 backdrop-blur">
                {tx.course.categoryName}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-5">
              <h3 className="font-heading text-base font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                {tx.course.title}
              </h3>
              <p className="text-xs text-zinc-500">
                Instruktur · {tx.course.instructor}
              </p>
              <Link
                href={
                  tx.status === "SUCCESS"
                    ? `/learn/${tx.course.slug}`
                    : `/courses/${tx.course.slug}`
                }
                className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-bold text-[color:var(--color-brand-700)] transition hover:gap-1.5 dark:text-[color:var(--color-brand-300)]"
              >
                {tx.status === "SUCCESS" ? (
                  <>
                    <PlayCircle className="size-3.5" strokeWidth={2.4} />
                    Buka di pemutar
                  </>
                ) : (
                  <>Lihat halaman kursus →</>
                )}
              </Link>
            </div>
          </section>

          <ActionCard tx={tx} />
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
};

function Field({ icon: Icon, label, children }: FieldProps) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        <Icon className="size-3.5" strokeWidth={2.2} />
        {label}
      </p>
      <div className="mt-1.5 text-sm text-zinc-800 dark:text-zinc-200">
        {children}
      </div>
    </div>
  );
}

function ActionCard({ tx }: { tx: TransactionDetailDTO }) {
  return (
    <section className={cn(cardBase, "flex flex-col gap-4 p-6")}>
      {tx.status === "SUCCESS" ? (
        <>
          <DownloadReceiptButton transactionId={tx.id} />
          <Note tone="success">
            Kursus ini aktif — kamu punya akses seumur hidup. Pembelian bersifat
            final dan tidak ada pengembalian dana.
          </Note>
        </>
      ) : null}

      {tx.status === "PENDING" ? (
        <>
          <ContinuePaymentButton />
          <PendingCountdown expiresAt={tx.expiresAt} />
          <Note tone="pending">
            Selesaikan pembayaran sebelum batas waktu 60 menit. Lewat dari itu,
            pesanan otomatis kedaluwarsa.
          </Note>
        </>
      ) : null}

      {tx.status === "FAILED" ? (
        <Note tone="failed">
          Pembayaran gagal diproses dan tidak ada biaya yang ditagihkan. Kamu
          bisa membeli kembali kursus ini kapan saja melalui halaman kursus.
        </Note>
      ) : null}

      {tx.status === "EXPIRED" ? (
        <Note tone="muted">
          Pesanan kedaluwarsa karena melewati batas waktu pembayaran 60 menit.
          Buat pesanan baru dari halaman kursus untuk mencoba lagi.
        </Note>
      ) : null}
    </section>
  );
}

function Note({
  tone,
  children,
}: {
  tone: "success" | "pending" | "failed" | "muted";
  children: React.ReactNode;
}) {
  const toneClass = {
    success:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
    pending:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
    failed: "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200",
    muted:
      "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300",
  }[tone];

  return (
    <p
      className={cn(
        "rounded-2xl px-4 py-3 text-xs leading-relaxed",
        toneClass,
      )}
    >
      {children}
    </p>
  );
}
