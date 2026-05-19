"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Compass,
  Inbox,
  ScrollText,
  Sparkles,
  Trophy,
} from "lucide-react";

import { useCertificatesQuery } from "@/hooks/use-certificates";
import type {
  CertificateClaimedRowDTO,
  CertificateUnclaimedRowDTO,
  CertificatesPageDTO,
} from "@/lib/certificate-data-loader";
import { formatDateID } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import {
  CERTIFICATES_PAGE_SIZES,
  type CertificatesPageSize,
  type CertificatesSort,
} from "@/lib/validators/certificates";

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
  ClaimCertificateButton,
  ClaimedCertificateActions,
} from "./certificate-row-actions";

const SORT_OPTIONS: { value: CertificatesSort; label: string }[] = [
  { value: "desc", label: "Terbaru" },
  { value: "asc", label: "Terlama" },
];

function parseSort(value: string | null): CertificatesSort {
  return value === "asc" ? "asc" : "desc";
}

function parsePageSize(value: string | null): CertificatesPageSize {
  const n = Number(value);
  return (CERTIFICATES_PAGE_SIZES as readonly number[]).includes(n)
    ? (n as CertificatesPageSize)
    : 10;
}

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function CertificatesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = parseSort(searchParams.get("sort"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const page = parsePage(searchParams.get("page"));

  const filters = { sort, pageSize, page };

  function pushParams(next: {
    sort: CertificatesSort;
    pageSize: CertificatesPageSize;
    page: number;
  }) {
    const params = new URLSearchParams();
    if (next.sort !== "desc") params.set("sort", next.sort);
    if (next.pageSize !== 10) params.set("pageSize", String(next.pageSize));
    if (next.page !== 1) params.set("page", String(next.page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const { data, isPending, isError } = useCertificatesQuery(filters);

  return (
    <div className="flex flex-col gap-7">
      <Header />

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : data ? (
        <CertificatesContent
          data={data}
          filters={filters}
          onSortChange={(value) =>
            pushParams({ sort: value, pageSize, page: 1 })
          }
          onPageSizeChange={(value) =>
            pushParams({ sort, pageSize: value, page: 1 })
          }
          onPageChange={(value) => pushParams({ sort, pageSize, page: value })}
        />
      ) : null}
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sertifikat
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-300/70">
          Klaim sertifikat untuk kursus yang sudah selesai, lalu unduh atau
          bagikan tautan verifikasi publik.
        </p>
      </div>
      <Link
        href="/catalog"
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-5 text-[12px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)]"
      >
        <Compass className="size-3.5" strokeWidth={2.4} />
        Jelajah Katalog
      </Link>
    </div>
  );
}

type ContentProps = {
  data: CertificatesPageDTO;
  filters: {
    sort: CertificatesSort;
    pageSize: CertificatesPageSize;
    page: number;
  };
  onSortChange: (value: CertificatesSort) => void;
  onPageSizeChange: (value: CertificatesPageSize) => void;
  onPageChange: (value: number) => void;
};

function CertificatesContent({
  data,
  filters,
  onSortChange,
  onPageSizeChange,
  onPageChange,
}: ContentProps) {
  const { unclaimed, claimed, pagination } = data;
  const isEmpty = unclaimed.length === 0 && claimed.length === 0;

  if (isEmpty) {
    return <EmptyState />;
  }

  const rangeStart =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

  return (
    <div className="flex flex-col gap-5">
      {unclaimed.length > 0 ? (
        <PendingClaimsBanner count={unclaimed.length} />
      ) : null}

      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <Toolbar
          claimedTotal={pagination.total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          sort={filters.sort}
          pageSize={filters.pageSize}
          onSortChange={onSortChange}
          onPageSizeChange={onPageSizeChange}
        />

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50/60 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
                <TableHead className="h-11 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Nomor Sertifikat
                </TableHead>
                <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Nama Kursus
                </TableHead>
                <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Tanggal Terbit
                </TableHead>
                <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Tanggal Kedaluwarsa
                </TableHead>
                <TableHead className="h-11 pr-5 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unclaimed.length > 0 ? (
                <>
                  <SectionRow
                    label="Belum Diklaim"
                    icon={<Sparkles className="size-3.5" strokeWidth={2.4} />}
                    tone="brand"
                  />
                  {unclaimed.map((row) => (
                    <UnclaimedRow key={row.enrollmentId} row={row} />
                  ))}
                </>
              ) : null}

              {claimed.length > 0 ? (
                <>
                  {unclaimed.length > 0 ? (
                    <SectionRow
                      label="Sertifikat Diterbitkan"
                      icon={<Trophy className="size-3.5" strokeWidth={2.4} />}
                      tone="muted"
                    />
                  ) : null}
                  {claimed.map((row) => (
                    <ClaimedRow key={row.id} row={row} />
                  ))}
                </>
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="px-5 py-8 text-center text-xs text-zinc-500"
                  >
                    Belum ada sertifikat yang diterbitkan di halaman ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <MobileRows unclaimed={unclaimed} claimed={claimed} />

        {pagination.totalPages > 1 ? (
          <div className="border-t border-zinc-200 px-5 py-4 dark:border-[color:var(--color-surface-border)]">
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PendingClaimsBanner({ count }: { count: number }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-brand-200)] bg-[color:var(--color-brand-50)] p-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_18px_-10px_rgba(43,114,234,0.7)]">
        <Award className="size-4" strokeWidth={2.4} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[color:var(--color-brand-900)]">
          Kamu punya {count} sertifikat siap diklaim
        </p>
        <p className="mt-0.5 text-xs text-[color:var(--color-brand-800)]/80">
          Selesaikan klaim untuk mendapatkan PDF dan tautan verifikasi publik.
        </p>
      </div>
    </div>
  );
}

type ToolbarProps = {
  claimedTotal: number;
  rangeStart: number;
  rangeEnd: number;
  sort: CertificatesSort;
  pageSize: CertificatesPageSize;
  onSortChange: (value: CertificatesSort) => void;
  onPageSizeChange: (value: CertificatesPageSize) => void;
};

function Toolbar({
  claimedTotal,
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
        {claimedTotal === 0 ? (
          <span>Belum ada sertifikat diterbitkan</span>
        ) : (
          <>
            Menampilkan{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {claimedTotal}
            </span>{" "}
            sertifikat
          </>
        )}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="cert-sort"
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
            <SelectTrigger id="cert-sort" className="min-w-32">
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
            htmlFor="cert-page-size"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500"
          >
            Per Halaman
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              if (typeof value !== "string") return;
              const n = Number(value);
              if ((CERTIFICATES_PAGE_SIZES as readonly number[]).includes(n)) {
                onPageSizeChange(n as CertificatesPageSize);
              }
            }}
          >
            <SelectTrigger id="cert-page-size" className="min-w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CERTIFICATES_PAGE_SIZES.map((n) => (
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

function SectionRow({
  label,
  icon,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  tone: "brand" | "muted";
}) {
  return (
    <TableRow
      className={cn(
        "hover:bg-transparent",
        tone === "brand"
          ? "bg-[color:var(--color-brand-50)]/60"
          : "bg-zinc-50/40 dark:bg-white/[0.015]",
      )}
    >
      <TableCell
        colSpan={5}
        className={cn(
          "px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em]",
          tone === "brand"
            ? "text-[color:var(--color-brand-800)]"
            : "text-zinc-500",
        )}
      >
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </TableCell>
    </TableRow>
  );
}

function UnclaimedRow({ row }: { row: CertificateUnclaimedRowDTO }) {
  return (
    <TableRow>
      <TableCell className="px-5 py-3 text-zinc-400">—</TableCell>
      <TableCell className="py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {row.courseTitle}
      </TableCell>
      <TableCell className="py-3 text-zinc-400">—</TableCell>
      <TableCell className="py-3 text-zinc-400">—</TableCell>
      <TableCell className="py-3 pr-5 text-right">
        <ClaimCertificateButton
          courseId={row.courseId}
          courseTitle={row.courseTitle}
        />
      </TableCell>
    </TableRow>
  );
}

function ClaimedRow({ row }: { row: CertificateClaimedRowDTO }) {
  return (
    <TableRow>
      <TableCell className="px-5 py-3 font-mono text-[12px] text-zinc-700 dark:text-zinc-200">
        {row.certificateNo}
      </TableCell>
      <TableCell className="py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {row.courseTitle}
      </TableCell>
      <TableCell className="py-3 text-sm text-zinc-700 dark:text-zinc-200">
        {formatDateID(row.issuedAt)}
      </TableCell>
      <TableCell className="py-3 text-sm text-zinc-700 dark:text-zinc-200">
        {row.expiresAt ? (
          formatDateID(row.expiresAt)
        ) : (
          <span className="text-zinc-400" title="Tanpa kedaluwarsa">
            —
          </span>
        )}
      </TableCell>
      <TableCell className="py-3 pr-5">
        <ClaimedCertificateActions
          certificateId={row.id}
          certificateNo={row.certificateNo}
        />
      </TableCell>
    </TableRow>
  );
}

function MobileRows({
  unclaimed,
  claimed,
}: {
  unclaimed: CertificateUnclaimedRowDTO[];
  claimed: CertificateClaimedRowDTO[];
}) {
  return (
    <div className="md:hidden">
      {unclaimed.length > 0 ? (
        <div className="border-b border-zinc-200 bg-[color:var(--color-brand-50)]/60 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-brand-800)] dark:border-[color:var(--color-surface-border)]">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-3.5" strokeWidth={2.4} />
            Belum Diklaim
          </span>
        </div>
      ) : null}
      {unclaimed.map((row) => (
        <div
          key={row.enrollmentId}
          className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 last:border-0 dark:border-[color:var(--color-surface-border)]"
        >
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {row.courseTitle}
          </p>
          <div>
            <ClaimCertificateButton
              courseId={row.courseId}
              courseTitle={row.courseTitle}
            />
          </div>
        </div>
      ))}

      {claimed.length > 0 ? (
        <>
          {unclaimed.length > 0 ? (
            <div className="border-b border-zinc-200 bg-zinc-50/40 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.015]">
              <span className="inline-flex items-center gap-2">
                <Trophy className="size-3.5" strokeWidth={2.4} />
                Sertifikat Diterbitkan
              </span>
            </div>
          ) : null}
          {claimed.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 last:border-0 dark:border-[color:var(--color-surface-border)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-zinc-500">
                    {row.certificateNo}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {row.courseTitle}
                  </p>
                </div>
                <ClaimedCertificateActions
                  certificateId={row.id}
                  certificateNo={row.certificateNo}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Terbit
                  </p>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                    {formatDateID(row.issuedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Kedaluwarsa
                  </p>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                    {row.expiresAt ? formatDateID(row.expiresAt) : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (value: number) => void;
};

function PaginationBar({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = buildPageList(page, totalPages);
  return (
    <nav
      aria-label="Pagination sertifikat"
      className="flex items-center justify-center gap-1"
    >
      <PaginationButton
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Halaman sebelumnya"
      >
        Sebelumnya
      </PaginationButton>
      {pages.map((p, idx) =>
        p === "ellipsis" ? (
          <span
            key={`e-${idx}`}
            className="px-2 text-xs text-zinc-400"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-[12px] font-semibold transition",
              p === page
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_6px_14px_-8px_rgba(43,114,234,0.7)]"
                : "text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5",
            )}
          >
            {p}
          </button>
        ),
      )}
      <PaginationButton
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Halaman berikutnya"
      >
        Berikutnya
      </PaginationButton>
    </nav>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold text-zinc-700 ring-1 ring-zinc-200 transition",
        "hover:bg-zinc-100 dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

function buildPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p += 1) items.push(p);
  if (right < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

function EmptyState() {
  return (
    <div className="grid place-items-center gap-4 rounded-3xl bg-white p-12 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-14 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
        <ScrollText className="size-6" />
      </div>
      <div className="text-center">
        <p className="font-heading text-base font-extrabold text-zinc-900 dark:text-zinc-50">
          Belum ada sertifikat
        </p>
        <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
          Selesaikan kursusmu hingga progres 100% untuk dapat mengklaim
          sertifikat dengan tautan verifikasi publik.
        </p>
      </div>
      <Link
        href="/catalog"
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-6 text-[12px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)]"
      >
        <Compass className="size-3.5" strokeWidth={2.4} />
        Jelajah Katalog
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-5" />
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-300/70">
        Gagal memuat sertifikat. Coba muat ulang halaman.
      </p>
    </div>
  );
}
