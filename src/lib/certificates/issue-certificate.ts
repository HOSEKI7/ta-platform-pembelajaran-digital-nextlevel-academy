import "server-only";

import { prisma } from "@/lib/prisma";
import {
  isCertStorageConfigured,
  uploadCertificatePng,
} from "@/lib/bunny-cert-storage";

import { publicIdFromCertificateNo } from "./cert-id";
import { computeCertExpiry } from "./cert-expiry";
import { generateCertificateNo } from "./generate-certificate-no";
import {
  renderCertificatePng,
  type CertificateImageInput,
} from "./certificate-image";

/**
 * Certificate issuance + image lifecycle (PRD §6.6).
 *
 * A certificate is auto-issued the moment a course hits 100% (`ensureCertificate
 * Issued`, idempotent via the unique `enrollmentId`). The PNG render + Bunny
 * upload is then kicked off non-blocking via `after()` from the completion
 * route. If the PNG is still missing on read (render failed, ran in dev without
 * a cert zone, or the row predates this feature) the read path lazily fills it
 * in. Authenticity is ALWAYS established from the DB row, never from the file.
 */

const MAX_CERT_NO_RETRIES = 5;

/** Duck-typed P2002 check — `instanceof` is unreliable across bundle copies. */
function isUniqueErrorOn(err: unknown, field: string): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  const fields = Array.isArray(target)
    ? target.map(String)
    : typeof target === "string"
      ? [target]
      : [];
  return fields.some((f) => f.includes(field));
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

/** Public verification URL for a stored certificate number. */
export function certVerifyUrl(certificateNo: string): string {
  return `${appBaseUrl()}/cert/${publicIdFromCertificateNo(certificateNo)}`;
}

export type IssueCertificateInput = {
  userId: string;
  courseId: string;
  enrollmentId: string;
};

export type IssuedCertificate = {
  id: string;
  certificateNo: string;
};

/**
 * Idempotently issues a certificate for a completed enrollment. Safe to call
 * repeatedly and concurrently: the unique `enrollmentId` collapses races into
 * the existing row. Does NOT render the image — call
 * `generateAndStoreCertificateImage` (ideally via `after()`) for that.
 */
export async function ensureCertificateIssued(
  input: IssueCertificateInput,
): Promise<IssuedCertificate> {
  const existing = await prisma.certificate.findUnique({
    where: { enrollmentId: input.enrollmentId },
    select: { id: true, certificateNo: true },
  });
  if (existing) return existing;

  const issuedAt = new Date();
  const expiresAt = await computeCertExpiry(issuedAt);
  // Snapshot the recipient name at issuance — read by every render/display site
  // thereafter, so later account renames never alter an issued certificate.
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { name: true },
  });
  const recipientName = user?.name ?? "";

  for (let attempt = 0; attempt < MAX_CERT_NO_RETRIES; attempt += 1) {
    const certificateNo = generateCertificateNo();
    try {
      return await prisma.certificate.create({
        data: {
          userId: input.userId,
          courseId: input.courseId,
          enrollmentId: input.enrollmentId,
          certificateNo,
          recipientName,
          issuedAt,
          expiresAt,
        },
        select: { id: true, certificateNo: true },
      });
    } catch (err) {
      // Concurrent completion already created the row — return it.
      if (isUniqueErrorOn(err, "enrollmentId")) {
        const row = await prisma.certificate.findUnique({
          where: { enrollmentId: input.enrollmentId },
          select: { id: true, certificateNo: true },
        });
        if (row) return row;
      }
      // Astronomically unlikely cert-no collision — try a new suffix.
      if (isUniqueErrorOn(err, "certificateNo")) continue;
      throw err;
    }
  }
  throw new Error("Gagal membuat nomor sertifikat unik.");
}

type CertRenderRow = {
  certificateNo: string;
  recipientName: string | null;
  issuedAt: Date;
  expiresAt: Date | null;
  user: { name: string };
  course: { title: string };
};

function toImageInput(row: CertRenderRow): CertificateImageInput {
  return {
    // Prefer the immutable snapshot; fall back to live name only for legacy
    // rows not yet backfilled (transient — backfill populates them).
    recipientName: row.recipientName ?? row.user.name,
    courseTitle: row.course.title,
    certificateNo: row.certificateNo,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt,
    verifyUrl: certVerifyUrl(row.certificateNo),
  };
}

/**
 * Renders the certificate PNG, uploads it to the public Bunny cert zone, and
 * stores the permanent CDN URL on the row. Idempotent (PUT overwrites). Returns
 * the stored URL, or `null` when the cert zone isn't configured (dev) — in that
 * case the read path falls back to on-the-fly rendering. Never throws to its
 * `after()` caller: failures are logged and retried lazily on next read.
 */
export async function generateAndStoreCertificateImage(
  certId: string,
): Promise<string | null> {
  const row = await prisma.certificate.findUnique({
    where: { id: certId },
    select: {
      certificateNo: true,
      recipientName: true,
      issuedAt: true,
      expiresAt: true,
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  });
  if (!row) return null;

  if (!isCertStorageConfigured()) return null;

  const png = await renderCertificatePng(toImageInput(row));
  const publicId = publicIdFromCertificateNo(row.certificateNo);
  const url = await uploadCertificatePng(publicId, png);
  await prisma.certificate.update({
    where: { id: certId },
    data: { imageUrl: url },
  });
  return url;
}

export type CertImageRef = {
  id: string;
  certificateNo: string;
  imageUrl: string | null;
};

/**
 * Resolves the URL to display for a certificate's PNG. Prefers the stored CDN
 * URL; if missing, lazily generates+stores it (when the cert zone is
 * configured) and otherwise falls back to the same-origin on-the-fly render
 * route so the image still shows in dev. Never throws.
 */
export async function resolveCertificateImageUrl(
  cert: CertImageRef,
): Promise<string> {
  if (cert.imageUrl) return cert.imageUrl;

  const publicId = publicIdFromCertificateNo(cert.certificateNo);
  if (isCertStorageConfigured()) {
    try {
      const url = await generateAndStoreCertificateImage(cert.id);
      if (url) return url;
    } catch (err) {
      console.error("[certificate] lazy image regen failed", cert.id, err);
    }
  }
  // Dev / fallback: render live through our own route.
  return `${appBaseUrl()}/api/public/cert/${publicId}/image`;
}

/**
 * Returns the certificate PNG bytes for embedding in a PDF. Prefers fetching the
 * stored CDN image (guaranteeing the PDF matches exactly what was shared);
 * falls back to rendering live when no URL exists yet.
 */
export async function getCertificatePngBytes(
  cert: CertRenderRow & { imageUrl: string | null },
): Promise<Buffer> {
  if (cert.imageUrl) {
    const res = await fetch(cert.imageUrl, { cache: "no-store" });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    // Stored URL unreachable — fall through to a fresh render.
  }
  return renderCertificatePng(toImageInput(cert));
}
