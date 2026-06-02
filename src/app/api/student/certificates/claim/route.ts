import { NextResponse, after, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  ensureCertificateIssued,
  generateAndStoreCertificateImage,
} from "@/lib/certificates/issue-certificate";
import { prisma } from "@/lib/prisma";
import { claimCertificateSchema } from "@/lib/validators/certificates";

export const dynamic = "force-dynamic";
// May render/upload the certificate PNG as a fallback — needs Node runtime.
export const runtime = "nodejs";

/**
 * POST /api/student/certificates/claim
 *
 * Certificates are auto-issued at 100% completion (PRD §6.6), so "claiming" is
 * now a FORMALITY: it stamps `claimedAt`, moving the certificate from the
 * "Belum Diklaim" group into "Diterbitkan". Idempotent — re-claiming returns
 * the same row. As a safety net it also issues the certificate if it somehow
 * doesn't exist yet, and kicks off image generation when missing.
 */
export async function POST(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const parsed = claimCertificateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const { courseId } = parsed.data;

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, progressPct: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment tidak ditemukan." },
        { status: 404 },
      );
    }
    if (enrollment.progressPct < 100) {
      return NextResponse.json(
        { error: "Kursus belum 100% selesai." },
        { status: 400 },
      );
    }

    // Safety net: issue if not yet auto-issued, then acknowledge.
    const issued = await ensureCertificateIssued({
      userId,
      courseId,
      enrollmentId: enrollment.id,
    });

    const certificate = await prisma.certificate.update({
      where: { id: issued.id },
      data: { claimedAt: new Date() },
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
        expiresAt: true,
        imageUrl: true,
      },
    });

    // Ensure the PNG exists (no-op if already generated). Non-blocking.
    if (!certificate.imageUrl) {
      after(() => generateAndStoreCertificateImage(certificate.id));
    }

    return NextResponse.json(
      {
        data: {
          certificate: {
            id: certificate.id,
            certificateNo: certificate.certificateNo,
            issuedAt: certificate.issuedAt.toISOString(),
            expiresAt: certificate.expiresAt
              ? certificate.expiresAt.toISOString()
              : null,
          },
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[POST /api/student/certificates/claim]", err);
    return NextResponse.json(
      { error: "Gagal mengklaim sertifikat." },
      { status: 500 },
    );
  }
}
