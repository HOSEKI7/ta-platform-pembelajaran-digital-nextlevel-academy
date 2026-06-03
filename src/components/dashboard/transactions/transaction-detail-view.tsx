"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, ShoppingBag } from "lucide-react";

import { useOrderStatusQuery } from "@/hooks/use-order-status";
import type { TransactionDetailDTO } from "@/lib/transaction-data-loader";
import { cn } from "@/lib/utils";

import { InvoiceCard } from "./invoice-card";
import {
  ContinuePaymentButton,
  PendingCountdown,
} from "./transaction-detail-actions";

type Props = {
  tx: TransactionDetailDTO;
  customer: { name: string; email: string };
};

/**
 * While a PENDING order is open, poll its status (the endpoint reconciles with
 * Midtrans) and refresh the server component once it becomes terminal so the
 * actions/notes update without a manual reload. Mounted only for PENDING.
 */
function PendingStatusWatcher({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: live } = useOrderStatusQuery(orderId, "PENDING");
  const refreshedRef = useRef(false);

  useEffect(() => {
    const status = live?.status;
    if (!status || status === "PENDING" || refreshedRef.current) return;
    refreshedRef.current = true;
    router.refresh();
  }, [live?.status, router]);

  return null;
}

export function TransactionDetailView({ tx, customer }: Props) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExpire = useCallback(() => router.refresh(), [router]);

  async function handleDownload() {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Invoice-${tx.paymentInvoiceId ?? tx.id}.png`;
      a.click();
      toast.success("Invoice berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh invoice. Coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-50 duration-500">
      <Link
        href="/transactions"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Transaksi
      </Link>

      {/* Captured region: the invoice card only. */}
      <div ref={cardRef}>
        <InvoiceCard tx={tx} customer={customer} />
      </div>

      {/* Actions live OUTSIDE the card so they never appear in the image. */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        {tx.status === "SUCCESS" ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
              "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
              "hover:bg-[color:var(--color-brand-600)]",
              "disabled:cursor-not-allowed disabled:opacity-70",
            )}
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            ) : (
              <Download className="size-4" strokeWidth={2.4} />
            )}
            <span>Unduh Invoice (Gambar)</span>
          </button>
        ) : null}

        {tx.status === "PENDING" ? (
          <>
            <PendingStatusWatcher orderId={tx.id} />
            <ContinuePaymentButton slug={tx.course.slug} />
            <div className="flex justify-center">
              <PendingCountdown expiresAt={tx.expiresAt} onExpire={handleExpire} />
            </div>
            <Note tone="pending">
              Selesaikan pembayaran sebelum batas waktu 60 menit. Lewat dari itu,
              pesanan otomatis kedaluwarsa.
            </Note>
          </>
        ) : null}

        {tx.status === "FAILED" ? (
          <>
            <Note tone="failed">
              Pembayaran gagal atau dibatalkan, dan tidak ada biaya yang
              ditagihkan. Kamu bisa membeli kembali kursus ini kapan saja.
            </Note>
            <BuyAgainButton slug={tx.course.slug} />
          </>
        ) : null}

        {tx.status === "EXPIRED" ? (
          <>
            <Note tone="muted">
              Pesanan kedaluwarsa karena melewati batas waktu pembayaran 60
              menit. Buat pesanan baru untuk mencoba lagi.
            </Note>
            <BuyAgainButton slug={tx.course.slug} />
          </>
        ) : null}
      </div>
    </div>
  );
}

/** Re-checkout CTA shown on terminal-but-unpaid orders (FAILED/EXPIRED). */
function BuyAgainButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/checkout/${slug}`}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
        "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
        "hover:bg-[color:var(--color-brand-600)]",
      )}
    >
      <ShoppingBag className="size-4" strokeWidth={2.4} />
      <span>Beli Lagi</span>
    </Link>
  );
}

function Note({
  tone,
  children,
}: {
  tone: "pending" | "failed" | "muted";
  children: React.ReactNode;
}) {
  const toneClass = {
    pending:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
    failed: "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200",
    muted: "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300",
  }[tone];

  return (
    <p className={cn("rounded-2xl px-4 py-3 text-xs leading-relaxed", toneClass)}>
      {children}
    </p>
  );
}
