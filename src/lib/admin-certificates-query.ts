/**
 * Shared types + query-key factory + URL parsers for the admin Certificate
 * Management surface at `/admin/certificates` (PRD §6.11.7). Safe to import from
 * both Server Components and Client Components — keep this file free of any
 * Prisma / server-only imports.
 *
 * The data layer (Prisma queries) lives in `./admin-certificates-loader.ts`.
 *
 * This surface is read-only (monitoring + lookup): the admin cannot revoke or
 * edit issued certificates per PRD §6.11.7. The only write action lives on the
 * page (global expiry config) and is handled by its own settings module.
 */

export const PAGE_SIZE = 10;

/** Status dropdown values — "all" is the unfiltered default. */
export const STATUS_FILTERS = ["all", "valid", "expired"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** Derived validity shown as a badge. Mirrors the filter values minus "all". */
export type CertificateDerivedStatus = "valid" | "expired";

/** Sort options — by issue date. */
export const SORT_OPTIONS = ["issued_desc", "issued_asc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type AdminCertificatesParams = {
  page: number;
  status: StatusFilter;
  sort: SortOption;
  search: string;
  /** "" = all courses. */
  courseId: string;
};

export type AdminCertificateRow = {
  id: string;
  certificateNo: string;
  recipientName: string;
  recipientEmail: string;
  recipientImage: string | null;
  courseTitle: string;
  /** ISO strings — formatted DD/MM/YYYY WIB on the client. */
  issuedAt: string;
  /** null = tanpa kedaluwarsa. */
  expiresAt: string | null;
  status: CertificateDerivedStatus;
};

export type AdminCertificatesResult = {
  rows: AdminCertificateRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Course option for the filter dropdown (only courses that have certificates). */
export type CertificateCourseOption = {
  id: string;
  title: string;
};

/** Global certificate expiry setting. `years = null` ⇒ no expiry. */
export type CertificateExpirySetting = {
  years: number | null;
};

/**
 * Pure validity derivation, mirrored exactly by the loader's where-clauses.
 * A null `expiresAt` means the certificate never expires (always valid).
 */
export function deriveCertificateStatus(
  expiresAt: Date | string | null,
  now: Date,
): CertificateDerivedStatus {
  if (expiresAt == null) return "valid";
  const exp = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return exp.getTime() <= now.getTime() ? "expired" : "valid";
}

export function adminCertificatesKey(params: AdminCertificatesParams) {
  return ["admin", "certificates", params] as const;
}

export function parseStatus(value: string | null | undefined): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

export function parseSort(value: string | null | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "issued_desc";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}

export function parseCourseId(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 64);
}
