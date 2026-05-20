import { Sparkles } from "lucide-react";

import { formatDateID } from "@/lib/format-date";

type Props = {
  recipientName: string;
  courseTitle: string;
  certificateNo: string;
  issuedAt: string;
  expiresAt: string | null;
  verificationUrl: string;
};

/**
 * Large styled HTML mockup of the certificate. Mirrors the layout of the
 * downloadable PDF (`src/lib/certificates/certificate-pdf.tsx`) so the
 * preview reads as a faithful representation of what gets downloaded.
 *
 * Aspect ratio locked to A4 landscape (√2:1) and all type uses `clamp()`
 * so the card scales cleanly between mobile and desktop without overflow.
 */
export function CertificatePreview({
  recipientName,
  courseTitle,
  certificateNo,
  issuedAt,
  expiresAt,
  verificationUrl,
}: Props) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-30px_rgba(35,65,137,0.35)] ring-1 ring-[color:var(--color-brand-200)]"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(71,142,244,0.06), transparent 38%)," +
            "radial-gradient(circle at 100% 100%, rgba(244,214,0,0.08), transparent 38%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-[1.4%] rounded-xl border-2 border-[color:var(--color-brand-500)]"
      />
      <div
        aria-hidden
        className="absolute inset-[2.2%] rounded-lg border border-[color:var(--color-brand-200)]"
      />

      <div className="relative flex h-full w-full flex-col items-center px-[6%] py-[5%] text-center">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-md bg-[color:var(--color-brand-500)] text-white">
            <Sparkles className="size-3" />
          </span>
          <span className="font-heading text-[clamp(11px,1.3vw,15px)] font-extrabold tracking-[0.22em] text-[color:var(--color-brand-900)]">
            NEXTLEVEL ACADEMY
          </span>
        </div>

        <p className="mt-[3%] text-[clamp(8px,0.9vw,11px)] font-bold tracking-[0.4em] text-zinc-400">
          SERTIFIKAT PENYELESAIAN
        </p>
        <h2 className="mt-1 font-heading text-[clamp(20px,3.8vw,46px)] font-extrabold tracking-tight text-zinc-900">
          SERTIFIKAT
        </h2>
        <span
          aria-hidden
          className="mt-[1.4%] block h-[3px] w-16 rounded-full bg-[color:var(--color-brand-accent,#F4D600)]"
        />

        <p className="mt-[3%] text-[clamp(10px,1.05vw,13px)] text-zinc-600">
          Diberikan dengan bangga kepada
        </p>
        <p className="mt-2 font-heading text-[clamp(22px,3.6vw,44px)] font-extrabold text-[color:var(--color-brand-700)]">
          {recipientName}
        </p>
        <span aria-hidden className="mt-[2%] block h-px w-[40%] bg-zinc-300/70" />
        <p className="mt-[2%] text-[clamp(10px,1vw,13px)] leading-relaxed text-zinc-600">
          atas penyelesaian penuh dari seluruh materi pembelajaran kursus
        </p>
        <p className="mt-1 font-heading text-[clamp(14px,1.9vw,22px)] font-bold text-zinc-900">
          {courseTitle}
        </p>

        <div className="mt-auto flex w-full items-end justify-between gap-2 pt-[3%]">
          <div className="min-w-0 text-left">
            <p className="text-[clamp(7px,0.7vw,9px)] font-bold tracking-[0.18em] text-zinc-400">
              TANGGAL TERBIT
            </p>
            <p className="mt-1 font-heading text-[clamp(10px,1.15vw,13px)] font-extrabold text-zinc-900">
              {formatDateID(issuedAt)}
            </p>
            {expiresAt ? (
              <p className="text-[clamp(8px,0.85vw,10px)] text-zinc-500">
                Berlaku hingga {formatDateID(expiresAt)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-center">
            <span aria-hidden className="block h-px w-28 bg-zinc-700/80" />
            <p className="mt-1 font-heading text-[clamp(9px,1vw,12px)] font-extrabold text-zinc-900">
              NextLevel Academy
            </p>
            <p className="text-[clamp(8px,0.85vw,10px)] text-zinc-500">
              Otoritas Penerbit
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-[clamp(7px,0.7vw,9px)] font-bold tracking-[0.18em] text-zinc-400">
              NO. SERTIFIKAT
            </p>
            <p className="mt-1 break-all font-mono text-[clamp(9px,1.05vw,12px)] font-extrabold text-zinc-900">
              {certificateNo}
            </p>
            <p className="break-all font-mono text-[clamp(7px,0.78vw,10px)] text-[color:var(--color-brand-700)]">
              {verificationUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
