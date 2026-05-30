"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminUsersParams,
  type AdminUsersResult,
  adminUsersKey,
} from "@/lib/admin-users-query";

async function fetchAdminUsers(
  params: AdminUsersParams,
): Promise<AdminUsersResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.role !== "all") sp.set("role", params.role);
  if (params.status !== "all") sp.set("status", params.status);
  if (params.search) sp.set("search", params.search);
  if (params.sort !== "created_desc") sp.set("sort", params.sort);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/users${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar pengguna (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminUsersResult };
  return json.data;
}

export function useAdminUsersQuery(params: AdminUsersParams) {
  return useQuery({
    queryKey: adminUsersKey(params),
    queryFn: () => fetchAdminUsers(params),
    placeholderData: (prev) => prev,
  });
}
