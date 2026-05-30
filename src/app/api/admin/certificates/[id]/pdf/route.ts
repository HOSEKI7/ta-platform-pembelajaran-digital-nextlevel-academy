import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { publicIdFromCertificateNo } from "@/lib/certificates/cert-id";
import { renderCertificatePdf } from "@/lib/certificates/certificate-pdf";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/certificates/:id/pdf — re-renders any issued certificate's PDF
 * for admin lookup/support (PRD §6.11.7). Mirrors the student route but is gated
 * to ADMINISTRATOR and has NO owner check (admins may inspect any certificate).
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
        issuedAt: true,
        expiresAt: true,
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

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const verifyUrl = `${baseUrl}/cert/${publicIdFromCertificateNo(cert.certificateNo)}`;

    const buffer = await renderCertificatePdf({
      recipientName: cert.user.name,
      courseTitle: cert.course.title,
      certificateNo: cert.certificateNo,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      verifyUrl,
    });

    return new NextResponse(new Uint8Array(buffer), {
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
