"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminBadgesParams,
  type AdminBadgesResult,
  adminBadgesKey,
} from "@/lib/admin-badges-query";

async function fetchAdminBadges(
  params: AdminBadgesParams,
): Promise<AdminBadgesResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.trigger !== "all") sp.set("trigger", params.trigger);
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/badges${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar badge (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminBadgesResult };
  return json.data;
}

export function useAdminBadgesQuery(params: AdminBadgesParams) {
  return useQuery({
    queryKey: adminBadgesKey(params),
    queryFn: () => fetchAdminBadges(params),
    placeholderData: (prev) => prev,
  });
}
