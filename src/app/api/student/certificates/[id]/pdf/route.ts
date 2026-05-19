import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { renderCertificatePdf } from "@/lib/certificates/certificate-pdf";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
        id: true,
        userId: true,
        certificateNo: true,
        issuedAt: true,
        expiresAt: true,
        course: { select: { title: true } },
        user: { select: { name: true } },
      },
    });

    // Owner-only: leak nothing about other users' certificates. If a user
    // asks for someone else's PDF, behave identically to "doesn't exist".
    if (!cert || cert.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Sertifikat tidak ditemukan." },
        { status: 404 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify/${cert.id}`;

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
    console.error("[GET /api/student/certificates/:id/pdf]", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF sertifikat." },
      { status: 500 },
    );
  }
}
