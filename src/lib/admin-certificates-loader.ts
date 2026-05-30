import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { CERTIFICATE_EXPIRY_YEARS_KEY } from "@/lib/certificates/cert-expiry";

import {
  PAGE_SIZE,
  deriveCertificateStatus,
  type AdminCertificatesParams,
  type AdminCertificatesResult,
  type CertificateCourseOption,
  type CertificateExpirySetting,
  type SortOption,
  type StatusFilter,
} from "./admin-certificates-query";

/**
 * Loads the admin Certificate Management surface (PRD §6.11.7).
 *
 * Read-only monitoring + lookup: tabel semua sertifikat yang diterbitkan, dgn
 * pencarian (nomor / penerima / kursus), filter status validitas + kursus, sort
 * tanggal terbit, dan pagination. Admin tidak bisa mencabut/mengedit sertifikat.
 *
 * Performance: 2 parallel queries (count + findMany), single nested `select`
 * for recipient + course (no N+1 follow-ups). The validity filter is a plain
 * column-vs-`now` predicate (no `$queryRaw` needed).
 */

/** Builds the validity part of the where clause for a derived status. */
function statusWhere(
  status: Exclude<StatusFilter, "all">,
  now: Date,
): Prisma.CertificateWhereInput {
  // valid    → expiresAt IS NULL OR expiresAt > now
  // expired  → expiresAt IS NOT NULL AND expiresAt <= now
  return status === "valid"
    ? { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }
    : { expiresAt: { not: null, lte: now } };
}

function orderByFor(sort: SortOption): Prisma.CertificateOrderByWithRelationInput {
  return sort === "issued_asc" ? { issuedAt: "asc" } : { issuedAt: "desc" };
}

export async function loadAdminCertificatesPage(
  params: AdminCertificatesParams,
): Promise<AdminCertificatesResult> {
  const { page, status, sort, search, courseId } = params;
  const now = new Date();

  const trimmed = search.trim();
  const where: Prisma.CertificateWhereInput = {
    ...(courseId ? { courseId } : {}),
    ...(status !== "all" ? statusWhere(status, now) : {}),
    ...(trimmed
      ? {
          OR: [
            { certificateNo: { contains: trimmed, mode: "insensitive" } },
            { user: { name: { contains: trimmed, mode: "insensitive" } } },
            { user: { email: { contains: trimmed, mode: "insensitive" } } },
            { course: { title: { contains: trimmed, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.certificate.count({ where }),
    prisma.certificate.findMany({
      where,
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
        expiresAt: true,
        user: { select: { name: true, email: true, image: true } },
        course: { select: { title: true } },
      },
      orderBy: orderByFor(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: rows.map((c) => ({
      id: c.id,
      certificateNo: c.certificateNo,
      recipientName: c.user.name,
      recipientEmail: c.user.email,
      recipientImage: c.user.image,
      courseTitle: c.course.title,
      issuedAt: c.issuedAt.toISOString(),
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      status: deriveCertificateStatus(c.expiresAt, now),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * Distinct courses that have at least one issued certificate — populates the
 * filter dropdown. `groupBy` keeps it to a single query; titles are fetched in
 * one follow-up `findMany` (bounded by the number of distinct courses).
 */
export async function loadCertificateCourseOptions(): Promise<
  CertificateCourseOption[]
> {
  const grouped = await prisma.certificate.groupBy({ by: ["courseId"] });
  const ids = grouped.map((g) => g.courseId);
  if (ids.length === 0) return [];

  const courses = await prisma.course.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return courses.map((c) => ({ id: c.id, title: c.title }));
}

/**
 * Reads the global `CERTIFICATE_EXPIRY_YEARS` setting. Returns `{ years: null }`
 * for "no expiry" (missing row, empty, non-numeric, or `<= 0`) — same semantics
 * as `computeCertExpiry`.
 */
export async function loadCertificateExpirySetting(): Promise<CertificateExpirySetting> {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: CERTIFICATE_EXPIRY_YEARS_KEY },
    select: { value: true },
  });
  const raw = setting?.value?.trim() ?? "";
  if (raw.length === 0) return { years: null };
  const years = Number(raw);
  if (!Number.isFinite(years) || years <= 0) return { years: null };
  return { years: Math.floor(years) };
}
