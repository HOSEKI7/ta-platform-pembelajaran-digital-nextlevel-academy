import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadPublicCertificate } from "@/lib/certificate-data-loader";
import { CERT_PUBLIC_ID_REGEX } from "@/lib/certificates/generate-certificate-no";

import { CertificateDetailView } from "@/components/public/certificates/certificate-detail-view";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevel.academy";

type Props = { params: Promise<{ certificateId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certificateId } = await params;
  if (!CERT_PUBLIC_ID_REGEX.test(certificateId)) {
    return {
      title: "Sertifikat tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const cert = await loadPublicCertificate(certificateId);
  if (!cert) {
    return {
      title: "Sertifikat tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const title = `Sertifikat ${cert.certificateNo} — ${cert.recipient.name}`;
  const description = `Verifikasi sertifikat penyelesaian kursus "${cert.course.title}" atas nama ${cert.recipient.name} di NextLevel Academy.`;

  return {
    title,
    description,
    alternates: { canonical: `/cert/${certificateId}` },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: `/cert/${certificateId}`,
      siteName: "NextLevel Academy",
      title,
      description,
      images: [
        {
          url: cert.course.thumbnailUrl,
          width: 1200,
          height: 630,
          alt: cert.course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cert.course.thumbnailUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicCertificatePage({ params }: Props) {
  const { certificateId } = await params;
  const cert = await loadPublicCertificate(certificateId);
  if (!cert) {
    notFound();
  }

  const verificationUrl = `${siteUrl.replace(/\/$/, "")}/cert/${cert.publicId}`;

  return <CertificateDetailView cert={cert} verificationUrl={verificationUrl} />;
}
