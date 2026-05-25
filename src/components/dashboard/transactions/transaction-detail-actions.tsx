"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Loader2,
  Timer,
} from "lucide-react";

import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

/** Inline copy-to-clipboard affordance for ids (transaction / invoice). */
export function CopyButton({ value, label = "Disalin.", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Salin"
      title="Salin"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg text-zinc-400 transition",
        "ring-1 ring-zinc-200 hover:bg-zinc-100 hover:text-zinc-700",
        "dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5 dark:hover:text-zinc-200",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" strokeWidth={2.6} />
      ) : (
        <Copy className="size-3.5" strokeWidth={2.2} />
      )}
    </button>
  );
}

const primaryBtn = cn(
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition",
  "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(43,114,234,0.75)]",
  "hover:bg-[color:var(--color-brand-600)]",
  "disabled:cursor-not-allowed disabled:opacity-70",
);

/** SUCCESS → downloads the server-rendered receipt PDF as a blob. */
export function DownloadReceiptButton({ transactionId }: { transactionId: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const res = await fetch(
        `/api/student/transactions/${transactionId}/receipt`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        let message = `Gagal mengunduh (${res.status})`;
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) message = json.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bukti-Transaksi-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunduh bukti transaksi.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={primaryBtn}
    >
      {isDownloading ? (
        <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
      ) : (
        <Download className="size-4" strokeWidth={2.4} />
      )}
      <span>Unduh Bukti Transaksi</span>
    </button>
  );
}

/**
 * PENDING → placeholder for the gateway hand-off. Midtrans isn't wired yet
 * (see `POST /api/orders` TODO), so this surfaces a "coming soon" toast
 * instead of a dead button.
 */
export function ContinuePaymentButton() {
  return (
    <button
      type="button"
      onClick={() =>
        toast.info("Pembayaran online akan segera tersedia.", {
          description: "Integrasi gateway Midtrans sedang disiapkan.",
        })
      }
      className={primaryBtn}
    >
      <ArrowUpRight className="size-4" strokeWidth={2.4} />
      <span>Lanjutkan Pembayaran</span>
    </button>
  );
}

/** Live MM:SS countdown to the 60-minute checkout deadline (PRD §6.4). */
export function PendingCountdown({ expiresAt }: { expiresAt: string }) {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target - Date.now()),
  );

  useEffect(() => {
    const handle = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(handle);
  }, [target]);

  const isExpired = remaining <= 0;
  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tabular-nums ring-1 ring-inset",
        isExpired
          ? "bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10"
          : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
      )}
    >
      <Timer className="size-4" strokeWidth={2.4} />
      {isExpired ? (
        <span>Waktu pembayaran habis</span>
      ) : (
        <span>
          Sisa waktu {mm}:{ss}
        </span>
      )}
    </div>
  );
}
