"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminCoursesParams,
  type AdminCoursesResult,
  adminCoursesKey,
} from "@/lib/admin-courses-query";

async function fetchAdminCourses(
  params: AdminCoursesParams,
): Promise<AdminCoursesResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.category) sp.set("category", params.category);
  if (params.status !== "all") sp.set("status", params.status);
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/courses${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar kursus (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminCoursesResult };
  return json.data;
}

export function useAdminCoursesQuery(params: AdminCoursesParams) {
  return useQuery({
    queryKey: adminCoursesKey(params),
    queryFn: () => fetchAdminCourses(params),
    placeholderData: (prev) => prev,
  });
}
