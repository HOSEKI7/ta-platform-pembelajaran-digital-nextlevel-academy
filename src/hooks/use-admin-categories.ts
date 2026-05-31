"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminCategoriesParams,
  type AdminCategoriesResult,
  adminCategoriesKey,
} from "@/lib/admin-categories-query";

async function fetchAdminCategories(
  params: AdminCategoriesParams,
): Promise<AdminCategoriesResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.sort !== "name_asc") sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/categories${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar kategori (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminCategoriesResult };
  return json.data;
}

export function useAdminCategoriesQuery(params: AdminCategoriesParams) {
  return useQuery({
    queryKey: adminCategoriesKey(params),
    queryFn: () => fetchAdminCategories(params),
    placeholderData: (prev) => prev,
  });
}
