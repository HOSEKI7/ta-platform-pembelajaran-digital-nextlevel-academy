import "server-only";

import { cache } from "react";

import {
  CERT_PUBLIC_ID_REGEX,
  certificateNoFromPublicId,
} from "@/lib/certificates/generate-certificate-no";
import { resolveCertificateImageUrl } from "@/lib/certificates/issue-certificate";
import { prisma } from "@/lib/prisma";
import type {
  CertificatesPageSize,
  CertificatesSort,
} from "@/lib/validators/certificates";

export type CertificateUnclaimedRowDTO = {
  kind: "unclaimed";
  id: string;
  certificateNo: string;
  courseId: string;
  courseTitle: string;
  recipientName: string;
  issuedAt: string;
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
 * Certificates are auto-issued at 100% completion (PRD §6.6), so every row is a
 * real `Certificate`. The "Klaim" button is now a formality that stamps
 * `claimedAt`. We split rows by that flag:
 *   - `unclaimed`: issued-but-not-yet-acknowledged (`claimedAt = null`). Always
 *     returned in full (count is tiny in practice).
 *   - `claimed`:   acknowledged rows, sorted by `issuedAt` and paginated.
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
    prisma.certificate.findMany({
      where: { userId, claimedAt: null },
      select: {
        id: true,
        certificateNo: true,
        courseId: true,
        recipientName: true,
        issuedAt: true,
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.certificate.count({ where: { userId, claimedAt: { not: null } } }),
    prisma.certificate.findMany({
      where: { userId, claimedAt: { not: null } },
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
      id: r.id,
      certificateNo: r.certificateNo,
      courseId: r.courseId,
      courseTitle: r.course.title,
      recipientName: r.recipientName ?? r.user.name,
      issuedAt: r.issuedAt.toISOString(),
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
  certificateNo: string;
  publicId: string;
  imageUrl: string;
  issuedAt: string;
  expiresAt: string | null;
  isExpired: boolean;
  recipient: {
    name: string;
    username: string | null;
    image: string | null;
  };
  course: {
    title: string;
    slug: string;
    thumbnailUrl: string;
    instructor: string;
    instructorImg: string;
    estimatedDuration: number | null;
    categoryName: string;
  };
};

/**
 * Public lookup for the `/cert/[certificateId]` page. The `certificateId`
 * URL param is the bare 12-character public id (e.g. `X106SZYRGGN2`); we
 * prepend the `NLA-` brand prefix here before hitting the DB.
 *
 * Returns `null` when the id is malformed or the certificate doesn't exist,
 * so the page can render a clean 404. Evaluates `isExpired` at fetch time
 * so the rendering component stays pure (React Compiler flags `Date.now()`
 * reads inside components).
 *
 * Wrapped in React `cache()` so the page's `generateMetadata` and its render
 * share a single lookup (and a single lazy image-regen) per request.
 */
export const loadPublicCertificate = cache(async function loadPublicCertificate(
  certificateId: string,
): Promise<PublicCertificateDTO | null> {
  if (!CERT_PUBLIC_ID_REGEX.test(certificateId)) return null;

  const cert = await prisma.certificate.findUnique({
    where: { certificateNo: certificateNoFromPublicId(certificateId) },
    select: {
      id: true,
      certificateNo: true,
      recipientName: true,
      imageUrl: true,
      issuedAt: true,
      expiresAt: true,
      course: {
        select: {
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: true,
          instructorImg: true,
          estimatedDuration: true,
          category: { select: { name: true } },
        },
      },
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });
  if (!cert) return null;

  const imageUrl = await resolveCertificateImageUrl({
    id: cert.id,
    certificateNo: cert.certificateNo,
    imageUrl: cert.imageUrl,
  });

  const now = Date.now();
  return {
    certificateNo: cert.certificateNo,
    publicId: certificateId,
    imageUrl,
    issuedAt: cert.issuedAt.toISOString(),
    expiresAt: cert.expiresAt ? cert.expiresAt.toISOString() : null,
    isExpired: cert.expiresAt ? cert.expiresAt.getTime() <= now : false,
    recipient: {
      // Immutable snapshot — never the live account name.
      name: cert.recipientName ?? cert.user.name,
      username: cert.user.username,
      image: cert.user.image,
    },
    course: {
      title: cert.course.title,
      slug: cert.course.slug,
      thumbnailUrl: cert.course.thumbnailUrl,
      instructor: cert.course.instructor,
      instructorImg: cert.course.instructorImg,
      estimatedDuration: cert.course.estimatedDuration,
      categoryName: cert.course.category.name,
    },
  };
});
