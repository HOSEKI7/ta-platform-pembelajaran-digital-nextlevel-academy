"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminVouchersParams,
  type AdminVouchersResult,
  adminVouchersKey,
} from "@/lib/admin-vouchers-query";

async function fetchAdminVouchers(
  params: AdminVouchersParams,
): Promise<AdminVouchersResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.status !== "all") sp.set("status", params.status);
  if (params.sort !== "valid_desc") sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/vouchers${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar voucher (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminVouchersResult };
  return json.data;
}

export function useAdminVouchersQuery(params: AdminVouchersParams) {
  return useQuery({
    queryKey: adminVouchersKey(params),
    queryFn: () => fetchAdminVouchers(params),
    placeholderData: (prev) => prev,
  });
}
