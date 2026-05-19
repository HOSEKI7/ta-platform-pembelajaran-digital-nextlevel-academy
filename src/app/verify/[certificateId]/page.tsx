import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { loadPublicCertificate } from "@/lib/certificate-data-loader";

import { VerifyResultCard } from "@/components/verify/verify-result-card";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ certificateId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  return {
    title: `Verifikasi Sertifikat ${certificateId}`,
    description:
      "Halaman verifikasi publik sertifikat penyelesaian kursus NextLevel Academy.",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await loadPublicCertificate(certificateId);

  return (
    <main className="min-h-svh bg-[color:var(--color-brand-50)]/40">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            aria-label="NextLevel Academy"
            className="-ml-2 inline-flex items-center"
          >
            <Image
              src="/NextLevel_LogoXFit.webp"
              alt="NextLevel Academy"
              width={1397}
              height={351}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:inline">
            Verifikasi Publik
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8 sm:py-14">
        <VerifyResultCard
          certificate={certificate}
          certificateId={certificateId}
        />

        <footer className="text-center text-[11px] text-zinc-500">
          Halaman ini dapat diakses publik. Sertifikat diterbitkan oleh
          NextLevel Academy.
        </footer>
      </div>
    </main>
  );
}
