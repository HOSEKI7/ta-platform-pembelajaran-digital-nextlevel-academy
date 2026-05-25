"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Receipt } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Pagination } from "@/components/dashboard/shared/pagination";
import { formatDateID, formatTimeID } from "@/lib/format-date";
import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  TRANSACTIONS_PAGE_SIZES,
  type TransactionsPageSize,
  type TransactionsSort,
} from "@/lib/validators/transactions";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  MOCK_TRANSACTIONS,
  type TransactionRowDTO,
  type TransactionStatus,
} from "./mock-data";

const SORT_OPTIONS: { value: TransactionsSort; label: string }[] = [
  { value: "desc", label: "Terbaru" },
  { value: "asc", label: "Terlama" },
];

const STATUS_META: Record<
  TransactionStatus,
  { label: string; dot: string; pill: string }
> = {
  PENDING: {
    label: "Menunggu",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  },
  SUCCESS: {
    label: "Berhasil",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  FAILED: {
    label: "Gagal",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    dot: "bg-zinc-400",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10",
  },
};

function parseSort(value: string | null): TransactionsSort {
  return value === "asc" ? "asc" : "desc";
}

function parsePageSize(value: string | null): TransactionsPageSize {
  const n = Number(value);
  return (TRANSACTIONS_PAGE_SIZES as readonly number[]).includes(n)
    ? (n as TransactionsPageSize)
    : 10;
}

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function TransactionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = parseSort(searchParams.get("sort"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const page = parsePage(searchParams.get("page"));

  function pushParams(next: {
    sort: TransactionsSort;
    pageSize: TransactionsPageSize;
    page: number;
  }) {
    const params = new URLSearchParams();
    if (next.sort !== "desc") params.set("sort", next.sort);
    if (next.pageSize !== 10) params.set("pageSize", String(next.pageSize));
    if (next.page !== 1) params.set("page", String(next.page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Mock-only: sort + paginate in memory. When the backend lands this whole
  // block becomes a `useQuery` over `/api/student/transactions`.
  const sorted = [...MOCK_TRANSACTIONS].sort((a, b) => {
    const da = new Date(a.checkoutAt).getTime();
    const db = new Date(b.checkoutAt).getTime();
    return sort === "asc" ? da - db : db - da;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Akademi · Pembayaran"
        title="Riwayat"
        accent="Transaksi"
        description="Semua pembelian kursusmu tersimpan permanen di sini — termasuk transaksi yang masih menunggu, gagal, atau kedaluwarsa."
      />

      {total === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
          <Toolbar
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            sort={sort}
            pageSize={pageSize}
            onSortChange={(value) =>
              pushParams({ sort: value, pageSize, page: 1 })
            }
            onPageSizeChange={(value) =>
              pushParams({ sort, pageSize: value, page: 1 })
            }
          />

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50/60 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
                  <TableHead className="h-11 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    ID Transaksi
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Nama Kursus
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Waktu Checkout
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Status
                  </TableHead>
                  <TableHead className="h-11 pr-5 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TransactionRow key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          </div>

          <MobileRows rows={rows} />

          {totalPages > 1 ? (
            <div className="border-t border-zinc-200 px-5 py-4 dark:border-[color:var(--color-surface-border)]">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={(value) => pushParams({ sort, pageSize, page: value })}
                ariaLabel="Paginasi transaksi"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

type ToolbarProps = {
  total: number;
  rangeStart: number;
  rangeEnd: number;
  sort: TransactionsSort;
  pageSize: TransactionsPageSize;
  onSortChange: (value: TransactionsSort) => void;
  onPageSizeChange: (value: TransactionsPageSize) => void;
};

function Toolbar({
  total,
  rangeStart,
  rangeEnd,
  sort,
  pageSize,
  onSortChange,
  onPageSizeChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[color:var(--color-surface-border)]">
      <p className="text-xs text-zinc-500">
        Menampilkan{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {total}
        </span>{" "}
        transaksi
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="trx-sort"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500"
          >
            Urut
          </label>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (typeof value === "string")
                onSortChange(value === "asc" ? "asc" : "desc");
            }}
          >
            <SelectTrigger id="trx-sort" className="min-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="trx-page-size"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500"
          >
            Per Halaman
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              if (typeof value !== "string") return;
              const n = Number(value);
              if ((TRANSACTIONS_PAGE_SIZES as readonly number[]).includes(n)) {
                onPageSizeChange(n as TransactionsPageSize);
              }
            }}
          >
            <SelectTrigger id="trx-page-size" className="min-w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTIONS_PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset",
        meta.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

function DetailButton({ transactionId }: { transactionId: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        toast.info("Detail transaksi akan segera tersedia.", {
          description: `ID: ${transactionId}`,
        })
      }
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold transition",
        "text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 hover:text-zinc-900",
        "dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5",
      )}
    >
      <FileText className="size-3.5" strokeWidth={2.4} />
      <span>Detail Transaksi</span>
    </button>
  );
}

function TransactionRow({ row }: { row: TransactionRowDTO }) {
  return (
    <TableRow>
      <TableCell className="px-5 py-3">
        <span
          className="block max-w-[15rem] truncate font-mono text-[12px] text-zinc-700 dark:text-zinc-200"
          title={row.id}
        >
          {row.id}
        </span>
      </TableCell>
      <TableCell className="py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {row.courseTitle}
      </TableCell>
      <TableCell className="py-3">
        <span className="block text-sm text-zinc-700 dark:text-zinc-200">
          {formatDateID(row.checkoutAt)}
        </span>
        <span className="block text-xs text-zinc-400 dark:text-zinc-500">
          {formatTimeID(row.checkoutAt)} WIB
        </span>
      </TableCell>
      <TableCell className="py-3">
        <StatusBadge status={row.status} />
      </TableCell>
      <TableCell className="py-3 pr-5 text-right">
        <DetailButton transactionId={row.id} />
      </TableCell>
    </TableRow>
  );
}

function MobileRows({ rows }: { rows: TransactionRowDTO[] }) {
  return (
    <div className="md:hidden">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 last:border-0 dark:border-[color:var(--color-surface-border)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="truncate font-mono text-[11px] text-zinc-500"
                title={row.id}
              >
                {row.id}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {row.courseTitle}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Waktu Checkout
              </p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                {formatDateID(row.checkoutAt)}
              </p>
              <p className="text-zinc-400 dark:text-zinc-500">
                {formatTimeID(row.checkoutAt)} WIB
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Total
              </p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                {idr.format(row.finalPrice)}
              </p>
            </div>
          </div>

          <div>
            <DetailButton transactionId={row.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center gap-4 rounded-3xl bg-white p-12 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-14 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
        <Receipt className="size-6" />
      </div>
      <div className="text-center">
        <p className="font-heading text-base font-extrabold text-zinc-900 dark:text-zinc-50">
          Belum ada transaksi
        </p>
        <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
          Setiap pembelian kursusmu akan muncul di sini lengkap dengan status
          pembayaran dan waktu checkout.
        </p>
      </div>
    </div>
  );
}
