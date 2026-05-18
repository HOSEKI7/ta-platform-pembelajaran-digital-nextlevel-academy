import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getQueryClient } from "@/lib/query-client";
import { loadStudentCatalogPage } from "@/lib/student-catalog-loader";
import {
  type Sort,
  type StudentCatalogParams,
  parsePage,
  parseSearch,
  parseSort,
  studentCatalogKey,
} from "@/lib/student-catalog-query";

import { CatalogView } from "@/components/dashboard/catalog/catalog-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jelajah Katalog",
  description: "Telusuri seluruh kursus NextLevel Academy.",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  category?: string;
  sort?: string;
  search?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function StudentCatalogPage({ searchParams }: Props) {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/catalog",
  });
  const userId = session.user.id;

  const sp = await searchParams;
  const params: StudentCatalogParams = {
    page: parsePage(sp.page),
    category: sp.category && sp.category.length > 0 ? sp.category : null,
    sort: parseSort(sp.sort) as Sort,
    search: parseSearch(sp.search),
  };

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: studentCatalogKey(params),
      queryFn: () => loadStudentCatalogPage(userId, params),
    }),
    // Match `useCategoriesQuery` key exactly so the cache hits on client.
    queryClient.prefetchQuery({
      queryKey: ["public", "categories"],
      queryFn: async () => {
        const [categories, totalPublished] = await Promise.all([
          prisma.category.findMany({
            select: {
              name: true,
              _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
            },
            orderBy: { name: "asc" },
          }),
          prisma.course.count({ where: { status: "PUBLISHED" } }),
        ]);
        return {
          categories: categories
            .filter((c) => c._count.courses > 0)
            .map((c) => ({ name: c.name, courseCount: c._count.courses })),
          totalPublished,
        };
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <CatalogView />
      </div>
    </HydrationBoundary>
  );
}
