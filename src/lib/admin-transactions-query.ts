/**
 * Shared types + query-key factory + URL parsers for the admin Transaction
 * Management table at `/admin/transactions`. Safe to import from both Server
 * Components and Client Components — keep this file free of any Prisma /
 * server-only imports.
 *
 * The data layer (Prisma queries) lives in `./admin-transactions-loader.ts` so
 * the database client never gets pulled into the browser bundle.
 */

import type {
  TransactionDetailDTO,
  TransactionStatus,
} from "@/lib/transaction-data-loader";

export const PAGE_SIZE = 10;

/** Status dropdown values — "all" is the unfiltered default. */
export const STATUS_FILTERS = [
  "all",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "CANCELED",
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** Tanggal (createdAt) sort order. */
export const SORT_OPTIONS = ["date_desc", "date_asc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type AdminTransactionsParams = {
  page: number;
  status: StatusFilter;
  sort: SortOption;
  search: string;
};

export type AdminTransactionRow = {
  /** Order id — shown verbatim as the "ID Transaksi". */
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  /** Final amount charged in IDR (whole rupiah). */
  finalPrice: number;
  status: TransactionStatus;
  /** ISO string — `Order.createdAt`. Formatted to DD/MM/YYYY WIB on the client. */
  createdAt: string;
};

export type AdminTransactionsResult = {
  rows: AdminTransactionRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * One entry in the Detail page "Log Transaksi" timeline — either a derived
 * lifecycle event (order created / paid / expired) or a recorded admin action
 * (accept / cancel / delete) pulled from `AuditLog`.
 */
export type TransactionLogEntry = {
  /** Stable React key. */
  id: string;
  kind: "lifecycle" | "admin";
  /** Human label in Bahasa Indonesia. */
  label: string;
  /** Supporting line (status change, actor, etc.) — null when not applicable. */
  detail: string | null;
  /** Admin who performed the action, when known. */
  actorName: string | null;
  /** ISO timestamp. */
  at: string;
};

export type AdminTransactionDetail = {
  tx: TransactionDetailDTO;
  customer: { name: string; email: string };
  log: TransactionLogEntry[];
};

export function adminTransactionsKey(params: AdminTransactionsParams) {
  return ["admin", "transactions", params] as const;
}

export function parseStatus(value: string | null | undefined): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

export function parseSort(value: string | null | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "date_desc";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
