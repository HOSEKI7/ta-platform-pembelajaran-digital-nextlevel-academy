import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { wrapPngInPdf } from "@/lib/certificates/certificate-pdf-wrapper";
import { getCertificatePngBytes } from "@/lib/certificates/issue-certificate";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/student/certificates/:id/pdf
 *
 * Streams a one-page PDF that simply wraps the certificate's PNG (the single
 * source of design — see `certificate-image.tsx`). The PNG is fetched from its
 * CDN URL when present, or rendered on the fly as a fallback. Nothing is
 * persisted. Owner-only: a request for someone else's certificate 404s.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { id } = await params;

  try {
    const cert = await prisma.certificate.findUnique({
      where: { id },
      select: {
        userId: true,
        certificateNo: true,
        issuedAt: true,
        expiresAt: true,
        imageUrl: true,
        course: { select: { title: true } },
        user: { select: { name: true } },
      },
    });

    if (!cert || cert.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Sertifikat tidak ditemukan." },
        { status: 404 },
      );
    }

    const png = await getCertificatePngBytes(cert);
    const pdf = await wrapPngInPdf(png);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateNo}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/student/certificates/:id/pdf]", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF sertifikat." },
      { status: 500 },
    );
  }
}
