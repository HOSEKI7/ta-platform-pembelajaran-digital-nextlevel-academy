import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminGradeList } from "@/lib/admin-internship-grades-loader";
import { loadAttendanceFilterOptions } from "@/lib/admin-internship-attendance-loader";
import {
  adminGradesKey,
  parseId,
  parsePage,
  parseSearch,
  type AdminGradeListParams,
} from "@/lib/admin-internship-grades-query";
import { attendanceFiltersKey } from "@/lib/admin-internship-attendance-query";

import { AdminGradesView } from "@/components/admin/internship/grades/admin-grades-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Nilai Akhir Magang · Admin",
  description: "Pantau dan sesuaikan nilai akhir peserta program magang lintas kelas.",
  robots: { index: false, follow: false },
};

type SP = {
  search?: string;
  batch?: string;
  field?: string;
  class?: string;
  page?: string;
};

export default async function AdminInternshipGradesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/internship/grades" });

  const sp = await searchParams;
  const params: AdminGradeListParams = {
    search: parseSearch(sp.search),
    batchId: parseId(sp.batch),
    fieldId: parseId(sp.field),
    classId: parseId(sp.class),
    page: parsePage(sp.page),
  };

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: adminGradesKey(params),
      queryFn: () => loadAdminGradeList(params),
    }),
    queryClient.prefetchQuery({
      queryKey: attendanceFiltersKey,
      queryFn: () => loadAttendanceFilterOptions(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminGradesView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
