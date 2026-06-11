"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/use-debounced-value";
import { GraduationCap, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  PAGE_SIZE,
  parseId,
  parsePage,
  parseSearch,
  type AdminGradeListParams,
  type AdminGradeRow,
} from "@/lib/admin-internship-grades-query";
import { classLetter } from "@/lib/internship-naming";
import { useAttendanceFiltersQuery } from "@/hooks/use-admin-attendance";
import {
  useAdminGradesQuery,
  useAdminUpsertGradeMutation,
} from "@/hooks/use-admin-grades";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Pagination } from "@/components/dashboard/shared/pagination";
import { SearchBox } from "@/components/dashboard/shared/search-box";

import { AdminGradesTable } from "./admin-grades-table";
import { AdminGradeDialog } from "./admin-grade-dialog";

/**
 * Mounts the override dialog + its per-student mutation together. Keyed by
 * `studentId` in the parent so it remounts (and reseeds form state) per row.
 */
function GradeDialogController({
  row,
  onClose,
}: {
  row: AdminGradeRow;
  onClose: () => void;
}) {
  const mutation = useAdminUpsertGradeMutation(row.studentId);

  return (
    <AdminGradeDialog
      open
      onOpenChange={(o) => {
        if (!o && !mutation.isPending) onClose();
      }}
      row={row}
      submitting={mutation.isPending}
      onSubmit={(payload) =>
        mutation.mutate(payload, {
          onSuccess: () => {
            toast.success(`Nilai ${row.name} tersimpan.`);
            onClose();
          },
          onError: (err) =>
            toast.error("Gagal menyimpan nilai", {
              description: err instanceof Error ? err.message : "Coba lagi.",
            }),
        })
      }
    />
  );
}

export function AdminGradesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const batchId = parseId(searchParams.get("batch"));
  const fieldId = parseId(searchParams.get("field"));
  const classId = parseId(searchParams.get("class"));
  const urlSearch = parseSearch(searchParams.get("search"));
  const urlPage = parsePage(searchParams.get("page"));

  const params: AdminGradeListParams = useMemo(
    () => ({ search: urlSearch, batchId, fieldId, classId, page: urlPage }),
    [urlSearch, batchId, fieldId, classId, urlPage],
  );

  const filtersQuery = useAttendanceFiltersQuery();
  const query = useAdminGradesQuery(params);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [selected, setSelected] = useState<AdminGradeRow | null>(null);

  const updateUrl = useCallback(
    (
      next: Partial<{
        batch: string;
        field: string;
        class: string;
        search: string;
        page: number;
      }>,
    ) => {
      const sp = new URLSearchParams(searchParams.toString());
      const setOrDelete = (key: string, value: string | undefined) => {
        if (value && value.length > 0) sp.set(key, value);
        else sp.delete(key);
      };

      // Cascade resets: batch clears field+class; field clears class.
      if ("batch" in next) {
        setOrDelete("batch", next.batch);
        sp.delete("field");
        sp.delete("class");
      }
      if ("field" in next) {
        setOrDelete("field", next.field);
        sp.delete("class");
      }
      if ("class" in next) setOrDelete("class", next.class);
      if ("search" in next) setOrDelete("search", (next.search ?? "").trim());

      if ("page" in next && next.page) {
        if (next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else {
        sp.delete("page");
      }

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Debounced search → URL.
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    updateUrl({ search: debouncedSearch });
  }, [debouncedSearch, urlSearch, updateUrl]);

  useEffect(() => {
    if (query.isError) {
      toast.error("Gagal memuat nilai", {
        description: query.error instanceof Error ? query.error.message : "Coba lagi.",
      });
    }
  }, [query.isError, query.error]);

  const filters = filtersQuery.data;

  const fieldOptions = useMemo(() => {
    if (!filters) return [];
    return batchId ? filters.fields.filter((f) => f.batchId === batchId) : filters.fields;
  }, [filters, batchId]);

  const classOptions = useMemo(() => {
    if (!filters) return [];
    if (fieldId) return filters.classes.filter((c) => c.fieldId === fieldId);
    if (batchId) {
      const fieldIds = new Set(
        filters.fields.filter((f) => f.batchId === batchId).map((f) => f.id),
      );
      return filters.classes.filter((c) => fieldIds.has(c.fieldId));
    }
    return filters.classes;
  }, [filters, batchId, fieldId]);

  const batchLabel = (id: string) =>
    id === "all" ? "Semua Batch" : (filters?.batches.find((b) => b.id === id)?.name ?? "Semua Batch");
  const fieldLabel = (id: string) =>
    id === "all" ? "Semua Bidang" : (filters?.fields.find((f) => f.id === id)?.name ?? "Semua Bidang");
  const classLabel = (id: string) => {
    if (id === "all") return "Semua Kelas";
    const c = filters?.classes.find((c) => c.id === id);
    return c ? `Kelas ${classLetter(c.name)}` : "Semua Kelas";
  };

  const data = query.data;
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? PAGE_SIZE;
  const rangeStart = total === 0 ? 0 : (urlPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(urlPage * pageSize, total);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Program Magang"
        title="Kelola"
        accent="Nilai Akhir"
        description="Pantau & sesuaikan nilai akhir peserta magang lintas kelas. Perubahan oleh admin tercatat di log audit dan mentor penanggung jawab diberi tahu."
      />

      {/* Toolbar: search + cascading filters */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => {
            setSearchInput("");
            updateUrl({ search: "" });
          }}
          placeholder="Cari nama peserta…"
          ariaLabel="Cari nama peserta"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={batchId || "all"}
            onValueChange={(v) => {
              if (typeof v === "string") updateUrl({ batch: v === "all" ? "" : v });
            }}
          >
            <SelectTrigger className="h-10 min-w-40 rounded-full" aria-label="Filter batch">
              <SelectValue>{(v: string) => batchLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Batch</SelectItem>
              {filters?.batches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={fieldId || "all"}
            onValueChange={(v) => {
              if (typeof v === "string") updateUrl({ field: v === "all" ? "" : v });
            }}
          >
            <SelectTrigger className="h-10 min-w-40 rounded-full" aria-label="Filter bidang">
              <SelectValue>{(v: string) => fieldLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bidang</SelectItem>
              {fieldOptions.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={classId || "all"}
            onValueChange={(v) => {
              if (typeof v === "string") updateUrl({ class: v === "all" ? "" : v });
            }}
          >
            <SelectTrigger className="h-10 min-w-36 rounded-full" aria-label="Filter kelas">
              <SelectValue>{(v: string) => classLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  Kelas {classLetter(c.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <GraduationCap className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Nilai
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {total > 0 ? (
                  <>
                    Menampilkan{" "}
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                      {rangeStart}–{rangeEnd}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                      {total}
                    </span>
                  </>
                ) : (
                  "Tidak ada peserta untuk filter ini"
                )}
              </p>
            </div>
          </div>
          {query.isFetching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {query.isPending ? (
          <TableSkeleton />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : (
          <AdminGradesTable
            rows={rows}
            isFetching={query.isFetching}
            onEdit={(row) => setSelected(row)}
          />
        )}
      </section>

      {totalPages > 1 ? (
        <Pagination
          page={urlPage}
          totalPages={totalPages}
          onChange={(p) => updateUrl({ page: p })}
          ariaLabel="Paginasi daftar nilai"
        />
      ) : null}

      {selected ? (
        <GradeDialogController
          key={selected.studentId}
          row={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-9 shrink-0 rounded-full bg-zinc-100 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-zinc-100 dark:bg-white/5" />
            <div className="h-3 w-1/5 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
          </div>
          <div className="h-8 w-28 rounded-full bg-zinc-100 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-6" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Gagal memuat daftar nilai
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}
