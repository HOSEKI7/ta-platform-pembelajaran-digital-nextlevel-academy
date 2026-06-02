import { NextResponse, type NextRequest } from "next/server";

import {
  CERT_PUBLIC_ID_REGEX,
  certificateNoFromPublicId,
} from "@/lib/certificates/cert-id";
import { renderCertificatePng } from "@/lib/certificates/certificate-image";
import { certVerifyUrl } from "@/lib/certificates/issue-certificate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/public/cert/[publicId]/image
 *
 * On-the-fly certificate PNG. This is a public FALLBACK used when a row has no
 * stored CDN `imageUrl` yet (e.g. dev without a Bunny cert zone, or before the
 * background render finishes). When a CDN URL exists we redirect to it so the
 * edge cache serves the bytes. Authenticity is still established by the DB
 * lookup — a malformed or unknown id 404s.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  if (!CERT_PUBLIC_ID_REGEX.test(publicId)) {
    return NextResponse.json(
      { error: "Sertifikat tidak ditemukan." },
      { status: 404 },
    );
  }

  try {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNo: certificateNoFromPublicId(publicId) },
      select: {
        certificateNo: true,
        issuedAt: true,
        expiresAt: true,
        imageUrl: true,
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    });
    if (!cert) {
      return NextResponse.json(
        { error: "Sertifikat tidak ditemukan." },
        { status: 404 },
      );
    }

    if (cert.imageUrl) {
      return NextResponse.redirect(cert.imageUrl, 302);
    }

    const png = await renderCertificatePng({
      recipientName: cert.user.name,
      courseTitle: cert.course.title,
      certificateNo: cert.certificateNo,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      verifyUrl: certVerifyUrl(cert.certificateNo),
    });

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // Short cache only — this is the not-yet-uploaded fallback.
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("[GET /api/public/cert/:publicId/image]", err);
    return NextResponse.json(
      { error: "Gagal membuat gambar sertifikat." },
      { status: 500 },
    );
  }
}
