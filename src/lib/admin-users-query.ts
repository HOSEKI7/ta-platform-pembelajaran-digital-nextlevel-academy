/**
 * Shared types + query-key factory + URL parsers for the admin User Management
 * table at `/admin/users` (PRD §6.11.4). Safe to import from both Server
 * Components and Client Components — keep this file free of any Prisma /
 * server-only imports.
 *
 * The data layer (Prisma queries) lives in `./admin-users-loader.ts` so the
 * database client never gets pulled into the browser bundle.
 */

import type { Role } from "@/generated/prisma";

export const PAGE_SIZE = 10;

/**
 * Role dropdown values — "all" is the unfiltered default. Administrator accounts
 * are managed on the dedicated `/admin/admins` page (PRD §6.11.12) and are never
 * listed here, so `ADMINISTRATOR` is intentionally excluded from this filter.
 */
export const ROLE_FILTERS = [
  "all",
  "PESERTA_DIDIK",
  "PESERTA_MAGANG",
  "MENTOR",
] as const;
export type RoleFilter = (typeof ROLE_FILTERS)[number];

/** Account status dropdown values. Soft-deleted users are always excluded. */
export const STATUS_FILTERS = ["all", "active", "inactive"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** Sort by registration date. */
export const SORT_OPTIONS = ["created_desc", "created_asc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** Human-readable role labels (Bahasa Indonesia). */
export const ROLE_LABELS: Record<Role, string> = {
  PESERTA_DIDIK: "Peserta Didik",
  PESERTA_MAGANG: "Peserta Magang",
  MENTOR: "Mentor",
  ADMINISTRATOR: "Administrator",
};

/** Roles an admin may create via the "Tambah Pengguna" form (PRD §6.11.4). */
export const CREATABLE_ROLES = [
  "PESERTA_DIDIK",
  "PESERTA_MAGANG",
  "MENTOR",
] as const satisfies readonly Role[];
export type CreatableRole = (typeof CREATABLE_ROLES)[number];

export type AdminUsersParams = {
  page: number;
  role: RoleFilter;
  status: StatusFilter;
  search: string;
  sort: SortOption;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  /** Universitas (magang only); null otherwise. */
  institution: string | null;
  isActive: boolean;
  /** ISO string — formatted to DD/MM/YYYY WIB on the client. */
  createdAt: string;
};

export type AdminUsersResult = {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** A class option for the create/edit form dropdown. */
export type ClassOption = {
  id: string;
  /** "Batch - Field - Class" — already includes batch & field per PRD §6.11.4. */
  label: string;
  /** Current number of interns assigned (for the magang quota indicator). */
  studentCount: number;
  maxStudents: number;
  /** Kode batch for this class's parent batch (for nomor_induk preview). */
  kodeBatch: string | null;
  /** Kode bidang for this class's parent field (for nomor_induk preview). */
  kodeBidang: string | null;
};

export function adminUsersKey(params: AdminUsersParams) {
  return ["admin", "users", params] as const;
}

export function parseRole(value: string | null | undefined): RoleFilter {
  return ROLE_FILTERS.includes(value as RoleFilter)
    ? (value as RoleFilter)
    : "all";
}

export function parseStatus(value: string | null | undefined): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

export function parseSort(value: string | null | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "created_desc";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
