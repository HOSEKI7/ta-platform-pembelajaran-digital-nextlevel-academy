import { NextResponse, type NextRequest } from "next/server";

import { Prisma, Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { computeCertExpiry } from "@/lib/certificates/cert-expiry";
import { generateCertificateNo } from "@/lib/certificates/generate-certificate-no";
import { prisma } from "@/lib/prisma";
import { claimCertificateSchema } from "@/lib/validators/certificates";

export const dynamic = "force-dynamic";

const MAX_CERT_NO_RETRIES = 5;

function isUniqueViolationOn(
  err: unknown,
  field: string,
): err is Prisma.PrismaClientKnownRequestError {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code !== "P2002") return false;
  const target = err.meta?.target;
  const fields = Array.isArray(target)
    ? target
    : typeof target === "string"
      ? [target]
      : [];
  return fields.some((f) => f.includes(field));
}

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
      select: {
        id: true,
        progressPct: true,
        certificate: { select: { id: true } },
      },
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
    if (enrollment.certificate) {
      return NextResponse.json(
        { error: "Sertifikat untuk kursus ini sudah diklaim." },
        { status: 409 },
      );
    }

    const issuedAt = new Date();
    const expiresAt = await computeCertExpiry(issuedAt);

    for (let attempt = 0; attempt < MAX_CERT_NO_RETRIES; attempt += 1) {
      const certificateNo = generateCertificateNo(issuedAt);
      try {
        const certificate = await prisma.certificate.create({
          data: {
            userId,
            courseId,
            enrollmentId: enrollment.id,
            certificateNo,
            issuedAt,
            expiresAt,
          },
          select: {
            id: true,
            certificateNo: true,
            issuedAt: true,
            expiresAt: true,
          },
        });
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
          { status: 201 },
        );
      } catch (err) {
        // Race: another request already created a certificate for this
        // enrollment (the @unique enrollmentId guard fires before the cert-
        // no check). Surface as 409.
        if (isUniqueViolationOn(err, "enrollmentId")) {
          return NextResponse.json(
            { error: "Sertifikat untuk kursus ini sudah diklaim." },
            { status: 409 },
          );
        }
        // Cosmic-ray collision on the random suffix — try a new one.
        if (isUniqueViolationOn(err, "certificateNo")) continue;
        throw err;
      }
    }

    console.error(
      "[POST /api/student/certificates/claim] cert-no collisions exhausted",
      { userId, courseId },
    );
    return NextResponse.json(
      { error: "Gagal membuat nomor sertifikat unik." },
      { status: 500 },
    );
  } catch (err) {
    console.error("[POST /api/student/certificates/claim]", err);
    return NextResponse.json(
      { error: "Gagal mengklaim sertifikat." },
      { status: 500 },
    );
  }
}
