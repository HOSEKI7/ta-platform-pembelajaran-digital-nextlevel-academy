import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import {
  loadAdminCourseCategories,
  loadAdminCoursesPage,
} from "@/lib/admin-courses-loader";
import {
  type AdminCoursesParams,
  adminCoursesKey,
  parsePage,
  parseSearch,
  parseStatus,
} from "@/lib/admin-courses-query";

import { AdminCoursesView } from "@/components/admin/courses/admin-courses-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Kursus",
  description:
    "Kelola seluruh kursus platform — buat, sunting, arsipkan, atau hapus.",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  category?: string;
  status?: string;
  search?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminCoursesPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/courses" });

  const sp = await searchParams;
  const params: AdminCoursesParams = {
    page: parsePage(sp.page),
    category: sp.category && sp.category.length > 0 ? sp.category : null,
    status: parseStatus(sp.status),
    search: parseSearch(sp.search),
  };

  const queryClient = getQueryClient();

  const [, categories] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: adminCoursesKey(params),
      queryFn: () => loadAdminCoursesPage(params),
    }),
    loadAdminCourseCategories(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminCoursesView categories={categories} />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
