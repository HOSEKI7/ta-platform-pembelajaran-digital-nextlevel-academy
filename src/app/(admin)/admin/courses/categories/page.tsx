import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminCategoriesPage } from "@/lib/admin-categories-loader";
import {
  type AdminCategoriesParams,
  adminCategoriesKey,
  parsePage,
  parseSearch,
  parseSort,
} from "@/lib/admin-categories-query";

import { AdminCategoriesView } from "@/components/admin/categories/admin-categories-view";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori Course",
  description: "Kelola kategori pengelompokan kursus (CRUD).",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  search?: string;
  sort?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminCategoriesPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/courses/categories",
  });

  const sp = await searchParams;
  const params: AdminCategoriesParams = {
    page: parsePage(sp.page),
    search: parseSearch(sp.search),
    sort: parseSort(sp.sort),
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminCategoriesKey(params),
    queryFn: () => loadAdminCategoriesPage(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Admin · Course"
            title="Kategori"
            accent="Course"
            description="Kelola kategori pengelompokan kursus — buat, ubah, dan hapus kategori beserta deskripsinya."
          />
          <AdminCategoriesView />
        </div>
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
