"use client";

import { useQuery } from "@tanstack/react-query";

import type { TransactionsPageDTO } from "@/lib/transaction-data-loader";
import { studentKeys } from "@/lib/student-query-keys";
import type {
  TransactionsPageSize,
  TransactionsSort,
} from "@/lib/validators/transactions";

export type TransactionsFiltersInput = {
  sort: TransactionsSort;
  pageSize: TransactionsPageSize;
  page: number;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Gagal memuat data (${res.status})`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      /* ignore parse error */
    }
    throw new Error(message);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function useTransactionsQuery(filters: TransactionsFiltersInput) {
  const qs = new URLSearchParams({
    sort: filters.sort,
    pageSize: String(filters.pageSize),
    page: String(filters.page),
  }).toString();
  return useQuery({
    queryKey: studentKeys.transactions(filters),
    queryFn: () =>
      getJson<TransactionsPageDTO>(`/api/student/transactions?${qs}`),
    staleTime: 30 * 1000,
  });
}
