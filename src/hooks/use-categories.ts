"use client";

import { useQuery } from "@tanstack/react-query";

export type Category = { name: string; courseCount: number };

export type CategoriesResult = {
  categories: Category[];
  totalPublished: number;
};

async function fetchCategories(): Promise<CategoriesResult> {
  const res = await fetch("/api/public/categories", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal memuat kategori (${res.status})`);
  const json = (await res.json()) as { data: CategoriesResult };
  return json.data;
}

export const categoriesQueryKey = ["public", "categories"] as const;

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}
