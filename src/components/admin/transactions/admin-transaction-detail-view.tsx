"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";

import type { AdminTransactionDetail } from "@/lib/admin-transactions-query";
import { cn } from "@/lib/utils";
import {
  useAcceptPaymentMutation,
  useCancelPaymentMutation,
  useDeleteTransactionMutation,
} from "@/hooks/use-admin-transaction-actions";

import { InvoiceCard } from "@/components/dashboard/transactions/invoice-card";
import { TransactionLogTimeline } from "./transaction-log-timeline";
import { AcceptPaymentDialog } from "./accept-payment-dialog";
import { CancelPaymentDialog } from "./cancel-payment-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";

type Props = {
  detail: AdminTransactionDetail;
};

export function AdminTransactionDetailView({ detail }: Props) {
  const { tx, customer, log } = detail;
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const acceptMutation = useAcceptPaymentMutation();
  const cancelMutation = useCancelPaymentMutation();
  const deleteMutation = useDeleteTransactionMutation();

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

  function handleAccept() {
    acceptMutation.mutate(tx.id, {
      onSuccess: () => {
        toast.success("Pembayaran diterima. Peserta kini punya akses kursus.");
        setAcceptOpen(false);
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal menerima pembayaran.",
        ),
    });
  }

  function handleCancel() {
    cancelMutation.mutate(tx.id, {
      onSuccess: () => {
        toast.success("Pembayaran dibatalkan.");
        setCancelOpen(false);
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal membatalkan pembayaran.",
        ),
    });
  }

  function handleDelete() {
    deleteMutation.mutate(tx.id, {
      onSuccess: () => {
        toast.success("Transaksi dihapus.");
        setDeleteOpen(false);
        router.push("/admin/transactions");
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal menghapus transaksi.",
        ),
    });
  }

  const isPending = tx.status === "PENDING";

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-50 duration-500">
      <Link
        href="/admin/transactions"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Transaksi
      </Link>

      {/* Captured region: the invoice card only. */}
      <div ref={cardRef}>
        <InvoiceCard tx={tx} customer={customer} />
      </div>

      {/* Admin actions live OUTSIDE the card so they never appear in the PNG. */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        {isPending ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAcceptOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-4" strokeWidth={2.4} />
              Terima Pembayaran
            </button>
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 dark:text-red-400 dark:ring-red-500/30 dark:hover:bg-red-500/10"
            >
              <Ban className="size-4" strokeWidth={2.4} />
              Batalkan Pembayaran
            </button>
          </div>
        ) : null}

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

        {/* Soft-delete is available for every status. */}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl px-5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-red-400"
        >
          <Trash2 className="size-3.5" strokeWidth={2.4} />
          Hapus Transaksi
        </button>
      </div>

      <TransactionLogTimeline log={log} />

      <AcceptPaymentDialog
        open={acceptOpen}
        onOpenChange={(o) => {
          if (!o && !acceptMutation.isPending) setAcceptOpen(false);
        }}
        courseTitle={tx.course.title}
        processing={acceptMutation.isPending}
        onConfirm={handleAccept}
      />
      <CancelPaymentDialog
        open={cancelOpen}
        onOpenChange={(o) => {
          if (!o && !cancelMutation.isPending) setCancelOpen(false);
        }}
        courseTitle={tx.course.title}
        processing={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (!o && !deleteMutation.isPending) setDeleteOpen(false);
        }}
        processing={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
