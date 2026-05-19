import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CalendarX2,
  GraduationCap,
  Hash,
  Search,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import type { PublicCertificateDTO } from "@/lib/certificate-data-loader";
import { formatDateID } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type Props = {
  certificate: PublicCertificateDTO | null;
  certificateId: string;
};

export function VerifyResultCard({ certificate, certificateId }: Props) {
  if (!certificate) {
    return <NotFoundCard certificateId={certificateId} />;
  }

  const isExpired = certificate.isExpired;

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-32px_rgba(35,74,174,0.32)] ring-1 ring-zinc-200">
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-5 sm:px-8",
          isExpired
            ? "bg-red-50/80"
            : "bg-[color:var(--color-brand-50)] sm:bg-gradient-to-r sm:from-[color:var(--color-brand-50)] sm:to-white",
        )}
      >
        <StatusBadge isExpired={isExpired} />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Sertifikat NextLevel Academy
          </p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-zinc-900">
            {certificate.certificateNo}
          </p>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          Diberikan kepada
        </p>
        <p className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          {certificate.recipientName}
        </p>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          atas penyelesaian kursus
        </p>
        <p className="mt-2 text-lg font-bold text-[color:var(--color-brand-900)] sm:text-xl">
          {certificate.courseTitle}
        </p>

        <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow
            icon={<UserRound className="size-4" strokeWidth={2.2} />}
            label="Nama Penerima"
            value={certificate.recipientName}
          />
          <DetailRow
            icon={<GraduationCap className="size-4" strokeWidth={2.2} />}
            label="Nama Kursus"
            value={certificate.courseTitle}
          />
          <DetailRow
            icon={<Hash className="size-4" strokeWidth={2.2} />}
            label="Nomor Sertifikat"
            value={certificate.certificateNo}
            mono
          />
          <DetailRow
            icon={<CalendarDays className="size-4" strokeWidth={2.2} />}
            label="Tanggal Terbit"
            value={formatDateID(certificate.issuedAt)}
          />
          <DetailRow
            icon={
              certificate.expiresAt ? (
                <CalendarX2 className="size-4" strokeWidth={2.2} />
              ) : (
                <BadgeCheck className="size-4" strokeWidth={2.2} />
              )
            }
            label="Tanggal Kedaluwarsa"
            value={
              certificate.expiresAt
                ? formatDateID(certificate.expiresAt)
                : "Tanpa kedaluwarsa"
            }
            muted={!certificate.expiresAt}
          />
          <DetailRow
            icon={<Building2 className="size-4" strokeWidth={2.2} />}
            label="Diterbitkan oleh"
            value="NextLevel Academy"
          />
        </dl>
      </div>
    </article>
  );
}

function StatusBadge({ isExpired }: { isExpired: boolean }) {
  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-red-700 ring-1 ring-red-200">
        <TriangleAlert className="size-3.5" strokeWidth={2.6} />
        Kedaluwarsa
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-success)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-success)] ring-1 ring-[color:var(--color-success)]/20">
      <BadgeCheck className="size-3.5" strokeWidth={2.6} />
      Valid
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-zinc-50/60 p-4 ring-1 ring-zinc-200/70">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-zinc-500 ring-1 ring-zinc-200">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </dt>
        <dd
          className={cn(
            "mt-1 break-words text-sm font-semibold text-zinc-900",
            mono && "font-mono text-[13px]",
            muted && "text-zinc-500",
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function NotFoundCard({ certificateId }: { certificateId: string }) {
  return (
    <article className="grid place-items-center gap-4 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 sm:p-14">
      <div className="grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600">
        <Search className="size-6" />
      </div>
      <div className="text-center">
        <p className="font-heading text-lg font-extrabold text-zinc-900">
          Sertifikat tidak ditemukan
        </p>
        <p className="mt-1 max-w-md text-sm text-zinc-500">
          Tidak ada sertifikat dengan ID{" "}
          <span className="font-mono text-xs text-zinc-700">
            {certificateId}
          </span>
          . Pastikan tautan verifikasi salin lengkap dan tidak terpotong.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-5 text-[12px] font-bold text-white transition hover:bg-zinc-800"
      >
        Kembali ke beranda
      </Link>
    </article>
  );
}
