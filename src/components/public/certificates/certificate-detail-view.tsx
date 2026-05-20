import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  Hash,
  ShieldCheck,
  Tag,
  UserRound,
} from "lucide-react";

import type { PublicCertificateDTO } from "@/lib/certificate-data-loader";
import { courseDurationText } from "@/lib/format";
import { formatDateID } from "@/lib/format-date";

import { SiteContainer } from "@/components/public/site-container";

import { CertificatePreview } from "./certificate-preview";

type Props = {
  cert: PublicCertificateDTO;
  verificationUrl: string;
};

export function CertificateDetailView({ cert, verificationUrl }: Props) {
  const { recipient, course, isExpired } = cert;
  const initials = getInitials(recipient.name);
  const instructorInitials = getInitials(course.instructor);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden pt-10 pb-16 sm:pt-14">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 85% 12%, rgba(71,142,244,0.20) 0%, transparent 42%)," +
              "radial-gradient(circle at 10% 90%, rgba(244,214,0,0.16) 0%, transparent 38%)," +
              "linear-gradient(180deg, rgba(238,245,255,0.85) 0%, rgba(255,255,255,1) 65%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[300px] opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(35,65,137,0.18) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(35,65,137,0.18) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)",
          }}
        />

        <SiteContainer>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-200)] backdrop-blur">
              <ShieldCheck className="size-3.5 text-[color:var(--color-brand-600)]" />
              Verifikasi Sertifikat Resmi
            </span>
            <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Sertifikat Terverifikasi
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
              Halaman ini adalah bukti publik bahwa{" "}
              <span className="font-semibold text-zinc-900">{recipient.name}</span>{" "}
              telah menyelesaikan kursus{" "}
              <span className="font-semibold text-zinc-900">{course.title}</span>{" "}
              di NextLevel Academy.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {isExpired ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  <Clock className="size-3.5" />
                  Kedaluwarsa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <BadgeCheck className="size-3.5" />
                  Valid
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                <Hash className="size-3.5 text-zinc-400" />
                {cert.certificateNo}
              </span>
            </div>
          </div>

          {/* Large certificate preview */}
          <div className="mx-auto mt-12 w-full max-w-5xl">
            <CertificatePreview
              recipientName={recipient.name}
              courseTitle={course.title}
              certificateNo={cert.certificateNo}
              issuedAt={cert.issuedAt}
              expiresAt={cert.expiresAt}
              verificationUrl={verificationUrl}
            />
          </div>
        </SiteContainer>
      </section>

      {/* DETAILS GRID */}
      <section className="pb-20">
        <SiteContainer>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Course card */}
            <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] backdrop-blur">
                  <Tag className="size-3" />
                  {course.categoryName}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                  Detail Kursus
                </p>
                <h3 className="font-heading text-lg font-extrabold text-zinc-900">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3 border-t border-zinc-100 pt-3 text-sm text-zinc-700">
                  <div className="relative size-9 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                    {course.instructorImg ? (
                      <Image
                        src={course.instructorImg}
                        alt={course.instructor}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[color:var(--color-brand-50)] text-[11px] font-extrabold text-[color:var(--color-brand-700)]">
                        {instructorInitials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900">
                      {course.instructor}
                    </p>
                    <p className="text-xs text-zinc-500">Instruktur</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="size-3.5" />
                  {courseDurationText(course.estimatedDuration)}
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-4 py-2 text-xs font-bold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] transition hover:bg-[color:var(--color-brand-100)]"
                >
                  Pelajari kursus ini
                  <ArrowRight className="size-3.5" strokeWidth={2.4} />
                </Link>
              </div>
            </article>

            {/* Recipient card */}
            <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200">
              <div
                aria-hidden
                className="h-24 w-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))",
                }}
              />
              <div className="-mt-10 flex flex-col gap-3 px-5 pb-5">
                <div className="relative size-20 overflow-hidden rounded-2xl bg-white ring-4 ring-white">
                  {recipient.image ? (
                    <Image
                      src={recipient.image}
                      alt={recipient.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[color:var(--color-brand-50)] font-heading text-xl font-extrabold text-[color:var(--color-brand-700)]">
                      {initials}
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                  Detail Penerima
                </p>
                <h3 className="font-heading text-lg font-extrabold text-zinc-900">
                  {recipient.name}
                </h3>
                {recipient.username ? (
                  <p className="text-sm text-zinc-500">@{recipient.username}</p>
                ) : null}
                <ul className="mt-2 flex flex-col gap-2 border-t border-zinc-100 pt-3 text-sm text-zinc-700">
                  <li className="flex items-center gap-2">
                    <UserRound className="size-4 text-zinc-400" />
                    Peserta NextLevel Academy
                  </li>
                  <li className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-zinc-400" />
                    Lulus dengan progres 100%
                  </li>
                </ul>
              </div>
            </article>

            {/* Certificate info card */}
            <article className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                Informasi Sertifikat
              </p>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  No. Sertifikat
                </p>
                <p className="mt-1 break-all font-mono text-base font-bold text-zinc-900">
                  {cert.certificateNo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <CalendarDays className="size-3.5" />
                    Tanggal Terbit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {formatDateID(cert.issuedAt)}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <Clock className="size-3.5" />
                    Kedaluwarsa
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {cert.expiresAt ? formatDateID(cert.expiresAt) : "Tidak ada"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[color:var(--color-brand-50)] p-3 ring-1 ring-[color:var(--color-brand-200)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-brand-700)]">
                  URL Verifikasi
                </p>
                <p className="mt-1 break-all font-mono text-xs text-[color:var(--color-brand-900)]">
                  {verificationUrl}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
                <BadgeCheck className="size-5 shrink-0 text-emerald-600" />
                <p className="text-xs leading-relaxed text-emerald-900">
                  Sertifikat ini telah diverifikasi sebagai dokumen resmi yang
                  diterbitkan oleh NextLevel Academy.
                </p>
              </div>
            </article>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-[color:var(--color-brand-600)] to-[color:var(--color-brand-800)] p-8 text-center text-white sm:p-10">
            <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
              Belajar di kelas yang sama
            </h2>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Ribuan peserta sudah mengambil kursus di NextLevel Academy.
              Jelajahi katalog lengkap kami dan mulai perjalananmu hari ini.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/courses/${course.slug}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[12px] font-bold text-[color:var(--color-brand-700)] shadow-sm transition hover:bg-[color:var(--color-brand-50)]"
              >
                Lihat kursus ini
                <ArrowRight className="size-3.5" strokeWidth={2.4} />
              </Link>
              <Link
                href="/courses"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-5 text-[12px] font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
              >
                Jelajah katalog NextLevel
              </Link>
            </div>
          </div>
        </SiteContainer>
      </section>
    </>
  );
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}
