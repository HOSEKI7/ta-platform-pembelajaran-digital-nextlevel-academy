"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/use-debounced-value";
import { Inbox, Loader2, Plus, Search, Trophy } from "lucide-react";

import type { BadgeIconOption } from "@/lib/badge-icons";
import {
  type AdminBadgeRow,
  type AdminBadgesParams,
  type TriggerFilter,
  TRIGGER_FILTERS,
  TRIGGER_LABELS,
  type BadgeCourseOption,
  parsePage,
  parseSearch,
  parseTrigger,
} from "@/lib/admin-badges-query";
import { useAdminBadgesQuery } from "@/hooks/use-admin-badges";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/dashboard/shared/pagination";
import { SearchBox } from "@/components/dashboard/shared/search-box";

import { BadgesTable } from "./badges-table";
import { BadgeFormDialog } from "./badge-form-dialog";

const TRIGGER_FILTER_LABELS: Record<TriggerFilter, string> = {
  all: "Semua Trigger",
  LEVEL_REACHED: TRIGGER_LABELS.LEVEL_REACHED,
  COURSES_COMPLETED: TRIGGER_LABELS.COURSES_COMPLETED,
  COURSE_SPECIFIC: TRIGGER_LABELS.COURSE_SPECIFIC,
};

type Props = {
  courseOptions: BadgeCourseOption[];
  iconPresets: BadgeIconOption[];
};

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; row: AdminBadgeRow }
  | null;

export function BadgeManagementView({ courseOptions, iconPresets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePage(searchParams.get("page"));
  const urlTrigger = parseTrigger(searchParams.get("trigger"));
  const urlSearch = parseSearch(searchParams.get("search"));

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogNonce, setDialogNonce] = useState(0);

  const params: AdminBadgesParams = useMemo(
    () => ({ page: urlPage, trigger: urlTrigger, search: urlSearch }),
    [urlPage, urlTrigger, urlSearch],
  );

  const badgesQuery = useAdminBadgesQuery(params);

  const updateUrl = useCallback(
    (next: Partial<{ page: number; trigger: TriggerFilter; search: string }>) => {
      const sp = new URLSearchParams(searchParams.toString());
      if ("search" in next) {
        const trimmed = (next.search ?? "").trim();
        if (trimmed.length > 0) sp.set("search", trimmed);
        else sp.delete("search");
      }
      if ("trigger" in next) {
        if (next.trigger && next.trigger !== "all") sp.set("trigger", next.trigger);
        else sp.delete("trigger");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else if ("trigger" in next || "search" in next) {
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

  const openCreate = () => {
    setDialogNonce((n) => n + 1);
    setDialog({ mode: "create" });
  };
  const openEdit = (row: AdminBadgeRow) => {
    setDialogNonce((n) => n + 1);
    setDialog({ mode: "edit", row });
  };

  const data = badgesQuery.data;
  const isFetching = badgesQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Manajemen Badge
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Buat dan kelola badge penghargaan untuk peserta didik.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-brand-700)]"
        >
          <Plus className="size-4" strokeWidth={2.6} />
          Tambah Badge
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => {
            setSearchInput("");
            updateUrl({ search: "" });
          }}
          placeholder="Cari nama badge…"
          ariaLabel="Cari badge"
        />
        <Select
          value={urlTrigger}
          onValueChange={(value) => {
            if (typeof value === "string")
              updateUrl({ trigger: value as TriggerFilter });
          }}
        >
          <SelectTrigger className="h-10 min-w-48 rounded-full" aria-label="Filter trigger">
            <SelectValue>
              {(value: string | null | undefined) =>
                TRIGGER_FILTER_LABELS[value as TriggerFilter] ?? "Semua Trigger"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_FILTERS.map((t) => (
              <SelectItem key={t} value={t}>
                {TRIGGER_FILTER_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <Trophy className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Badge
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {total > 0
                  ? `${total} badge`
                  : "Tidak ada badge untuk filter ini"}
              </p>
            </div>
          </div>
          {isFetching ? (
            <Loader2 className="size-4 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {badgesQuery.isPending ? (
          <TableSkeleton />
        ) : badgesQuery.isError ? (
          <ErrorState onRetry={() => badgesQuery.refetch()} />
        ) : total === 0 ? (
          <EmptyState search={urlSearch} onCreate={openCreate} />
        ) : (
          <BadgesTable rows={data!.rows} isFetching={isFetching} onEdit={openEdit} />
        )}
      </section>

      {totalPages > 1 ? (
        <Pagination
          page={urlPage}
          totalPages={totalPages}
          onChange={(p) => updateUrl({ page: p })}
          ariaLabel="Paginasi daftar badge"
        />
      ) : null}

      {dialog ? (
        <BadgeFormDialog
          key={dialogNonce}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={dialog.mode}
          initial={dialog.mode === "edit" ? dialog.row : undefined}
          courseOptions={courseOptions}
          iconPresets={iconPresets}
          onSubmitted={() => badgesQuery.refetch()}
        />
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-12 shrink-0 rounded-2xl bg-zinc-100 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-zinc-100 dark:bg-white/5" />
            <div className="h-3 w-1/4 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
          </div>
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
        Gagal memuat daftar badge
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

function EmptyState({
  search,
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        <Search className="size-5" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {search.length > 0
          ? `Tidak ada badge dengan nama “${search}”`
          : "Belum ada badge"}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[12px] font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        Tambah Badge
      </button>
    </div>
  );
}
