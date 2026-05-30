"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminTransactionsParams,
  type AdminTransactionsResult,
  adminTransactionsKey,
} from "@/lib/admin-transactions-query";

async function fetchAdminTransactions(
  params: AdminTransactionsParams,
): Promise<AdminTransactionsResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.status !== "all") sp.set("status", params.status);
  if (params.sort !== "date_desc") sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/transactions${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar transaksi (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminTransactionsResult };
  return json.data;
}

export function useAdminTransactionsQuery(params: AdminTransactionsParams) {
  return useQuery({
    queryKey: adminTransactionsKey(params),
    queryFn: () => fetchAdminTransactions(params),
    placeholderData: (prev) => prev,
  });
}
