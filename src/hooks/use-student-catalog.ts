"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type StudentCatalogParams,
  type StudentCatalogResult,
  studentCatalogKey,
} from "@/lib/student-catalog-query";

async function fetchStudentCatalog(
  params: StudentCatalogParams,
): Promise<StudentCatalogResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.category) sp.set("category", params.category);
  if (params.sort !== "latest") sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  const res = await fetch(
    `/api/student/catalog${qs ? `?${qs}` : ""}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`Gagal memuat katalog (${res.status})`);
  }
  const json = (await res.json()) as { data: StudentCatalogResult };
  return json.data;
}

export function useStudentCatalogQuery(params: StudentCatalogParams) {
  return useQuery({
    queryKey: studentCatalogKey(params),
    queryFn: () => fetchStudentCatalog(params),
    placeholderData: (prev) => prev,
  });
}
