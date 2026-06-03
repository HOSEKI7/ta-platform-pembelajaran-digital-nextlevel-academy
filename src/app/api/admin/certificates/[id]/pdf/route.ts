import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { wrapPngInPdf } from "@/lib/certificates/certificate-pdf-wrapper";
import { getCertificatePngBytes } from "@/lib/certificates/issue-certificate";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/certificates/:id/pdf — re-streams any certificate's PDF for
 * admin lookup/support (PRD §6.11.7). Like the student route it wraps the
 * certificate PNG (single source of design); gated to ADMINISTRATOR with NO
 * owner check (admins may inspect any certificate).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const cert = await prisma.certificate.findUnique({
      where: { id },
      select: {
        certificateNo: true,
        recipientName: true,
        issuedAt: true,
        expiresAt: true,
        imageUrl: true,
        course: { select: { title: true } },
        user: { select: { name: true } },
      },
    });

    if (!cert) {
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
    console.error("[GET /api/admin/certificates/:id/pdf]", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF sertifikat." },
      { status: 500 },
    );
  }
}
