import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CertificatesPageSize,
  CertificatesSort,
} from "@/lib/validators/certificates";

export type CertificateUnclaimedRowDTO = {
  kind: "unclaimed";
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  completedAt: string | null;
};

export type CertificateClaimedRowDTO = {
  kind: "claimed";
  id: string;
  certificateNo: string;
  courseTitle: string;
  issuedAt: string;
  expiresAt: string | null;
};

export type CertificatesPageDTO = {
  unclaimed: CertificateUnclaimedRowDTO[];
  claimed: CertificateClaimedRowDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CertificatesFilters = {
  sort: CertificatesSort;
  pageSize: CertificatesPageSize;
  page: number;
};

/**
 * Loads certificate rows for the student "Sertifikat" page.
 *
 * Returns two row groups so the UI can render them as a single visually-
 * unified table:
 *   - `unclaimed`: enrollments with `progressPct >= 100` that don't yet have
 *     a `Certificate`. Always returned in full (count is tiny in practice).
 *   - `claimed`:   existing `Certificate` rows, sorted by `issuedAt` and
 *     paginated independently.
 *
 * Pagination metadata only describes the claimed set so totalPages doesn't
 * jitter as new claims appear.
 */
export async function loadCertificateRows(
  userId: string,
  filters: CertificatesFilters,
): Promise<CertificatesPageDTO> {
  const { sort, pageSize, page } = filters;

  const [unclaimedRows, total, claimedRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        userId,
        progressPct: { gte: 100 },
        certificate: null,
      },
      select: {
        id: true,
        courseId: true,
        completedAt: true,
        course: { select: { title: true } },
      },
      orderBy: [
        { completedAt: { sort: "desc", nulls: "last" } },
        { enrolledAt: "desc" },
      ],
    }),
    prisma.certificate.count({ where: { userId } }),
    prisma.certificate.findMany({
      where: { userId },
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
        expiresAt: true,
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    unclaimed: unclaimedRows.map((r) => ({
      kind: "unclaimed",
      enrollmentId: r.id,
      courseId: r.courseId,
      courseTitle: r.course.title,
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    })),
    claimed: claimedRows.map((r) => ({
      kind: "claimed",
      id: r.id,
      certificateNo: r.certificateNo,
      courseTitle: r.course.title,
      issuedAt: r.issuedAt.toISOString(),
      expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
    })),
    pagination: { page, pageSize, total, totalPages },
  };
}

export type PublicCertificateDTO = {
  id: string;
  certificateNo: string;
  recipientName: string;
  courseTitle: string;
  issuedAt: string;
  expiresAt: string | null;
  isExpired: boolean;
};

/**
 * Public lookup for the `/verify/[certificateId]` page. Returns `null` when
 * the certificate doesn't exist — the page renders a friendly "not found"
 * card rather than a generic 404. Evaluates `isExpired` at fetch time so the
 * downstream render function stays pure (React Compiler flags clock reads
 * inside components).
 */
export async function loadPublicCertificate(
  certificateId: string,
): Promise<PublicCertificateDTO | null> {
  const cert = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: {
      id: true,
      certificateNo: true,
      issuedAt: true,
      expiresAt: true,
      course: { select: { title: true } },
      user: { select: { name: true } },
    },
  });
  if (!cert) return null;
  const now = Date.now();
  return {
    id: cert.id,
    certificateNo: cert.certificateNo,
    recipientName: cert.user.name,
    courseTitle: cert.course.title,
    issuedAt: cert.issuedAt.toISOString(),
    expiresAt: cert.expiresAt ? cert.expiresAt.toISOString() : null,
    isExpired: cert.expiresAt ? cert.expiresAt.getTime() <= now : false,
  };
}
