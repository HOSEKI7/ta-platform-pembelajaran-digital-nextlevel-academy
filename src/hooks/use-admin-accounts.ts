"use client";

import { useQuery } from "@tanstack/react-query";

import type { AdminAccountsData } from "@/lib/admin-accounts-loader";
import { adminAccountsKey } from "@/lib/admin-accounts-query";

async function fetchAdminAccounts(): Promise<AdminAccountsData> {
  const res = await fetch("/api/admin/admins", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar administrator (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminAccountsData };
  return json.data;
}

export function useAdminAccountsQuery() {
  return useQuery({
    queryKey: adminAccountsKey,
    queryFn: fetchAdminAccounts,
    placeholderData: (prev) => prev,
  });
}
