"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Download, Loader2, Sparkles } from "lucide-react";

import { publicIdFromCertificateNo } from "@/lib/certificates/cert-id";
import { cn } from "@/lib/utils";

import { ClaimCertificateDialog } from "./claim-certificate-dialog";

type ClaimButtonProps = {
  courseId: string;
  courseTitle: string;
  /** Snapshot name prefilled in the confirmation dialog. */
  recipientName: string;
};

export function ClaimCertificateButton({
  courseId,
  courseTitle,
  recipientName,
}: ClaimButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold text-white transition",
          "bg-[color:var(--color-brand-500)] shadow-[0_8px_18px_-10px_rgba(43,114,234,0.7)]",
          "hover:bg-[color:var(--color-brand-600)]",
        )}
      >
        <Sparkles className="size-3.5" strokeWidth={2.4} />
        <span>Klaim Sertifikat</span>
      </button>
      <ClaimCertificateDialog
        open={open}
        onOpenChange={setOpen}
        courseId={courseId}
        courseTitle={courseTitle}
        defaultName={recipientName}
      />
    </>
  );
}

type ClaimedActionsProps = {
  certificateId: string;
  certificateNo: string;
};

export function ClaimedCertificateActions({
  certificateId,
  certificateNo,
}: ClaimedActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const res = await fetch(
        `/api/student/certificates/${certificateId}/pdf`,
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
        )}
      >
        <BadgeCheck className="size-3.5" strokeWidth={2.4} />
      </Link>
    </div>
  );
}
