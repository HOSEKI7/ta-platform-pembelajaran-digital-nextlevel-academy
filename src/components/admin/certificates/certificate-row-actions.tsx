"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Download, Loader2 } from "lucide-react";

import { publicIdFromCertificateNo } from "@/lib/certificates/cert-id";
import { cn } from "@/lib/utils";

type Props = {
  certificateId: string;
  certificateNo: string;
};

/**
 * Read-only admin actions for a certificate row (PRD §6.11.7): re-download the
 * PDF (admin endpoint, no owner check) and open the public verification page.
 * No revoke/edit — the surface is monitoring + lookup only.
 */
export function CertificateRowActions({ certificateId, certificateNo }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/admin/certificates/${certificateId}/pdf`, {
        cache: "no-store",
      });
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
      a.download = `${certificateNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunduh sertifikat.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Unduh PDF ${certificateNo}`}
        title="Unduh PDF"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full text-zinc-600 transition",
          "ring-1 ring-zinc-200 hover:bg-zinc-100 hover:text-zinc-900",
          "dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/10 dark:hover:text-zinc-50",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isDownloading ? (
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
        ) : (
          <Download className="size-3.5" strokeWidth={2.4} />
        )}
      </button>
      <Link
        href={`/cert/${publicIdFromCertificateNo(certificateNo)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Buka halaman verifikasi untuk ${certificateNo}`}
        title="Verifikasi publik"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full text-[color:var(--color-brand-700)] transition",
          "ring-1 ring-[color:var(--color-brand-200)] hover:bg-[color:var(--color-brand-50)]",
          "dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30 dark:hover:bg-[color:var(--color-brand-500)]/10",
        )}
      >
        <BadgeCheck className="size-3.5" strokeWidth={2.4} />
      </Link>
    </div>
  );
}
