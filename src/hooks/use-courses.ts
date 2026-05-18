"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type CoursesPageParams,
  type CoursesPageResult,
  coursesQueryKey,
} from "@/lib/courses-query";

async function fetchCoursesPage(params: CoursesPageParams): Promise<CoursesPageResult> {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("sort", params.sort);
  if (params.category) search.set("category", params.category);

  const res = await fetch(`/api/public/courses?${search.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat kursus (${res.status})`);
  }
  const json = (await res.json()) as { data: CoursesPageResult };
  return json.data;
}

export function useCoursesQuery(params: CoursesPageParams) {
  return useQuery({
    queryKey: coursesQueryKey(params),
    queryFn: () => fetchCoursesPage(params),
    placeholderData: (prev) => prev,
  });
}
