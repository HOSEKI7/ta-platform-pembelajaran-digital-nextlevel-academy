import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminTaskList } from "@/lib/admin-internship-tasks-loader";
import { loadAttendanceFilterOptions } from "@/lib/admin-internship-attendance-loader";
import {
  adminTasksKey,
  parseId,
  parsePage,
  parseSearch,
  parseTaskStatus,
  type AdminTaskListParams,
} from "@/lib/admin-internship-tasks-query";
import { attendanceFiltersKey } from "@/lib/admin-internship-attendance-query";

import { AdminTasksView } from "@/components/admin/internship/tasks/admin-tasks-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Tugas Magang · Admin",
  description: "Pantau seluruh tugas program magang lintas kelas dan pengumpulan peserta.",
  robots: { index: false, follow: false },
};

type SP = {
  search?: string;
  batch?: string;
  field?: string;
  class?: string;
  status?: string;
  page?: string;
};

export default async function AdminInternshipTasksPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/internship/tasks" });

  const sp = await searchParams;
  const params: AdminTaskListParams = {
    search: parseSearch(sp.search),
    batchId: parseId(sp.batch),
    fieldId: parseId(sp.field),
    classId: parseId(sp.class),
    status: parseTaskStatus(sp.status),
    page: parsePage(sp.page),
  };

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: adminTasksKey(params),
      queryFn: () => loadAdminTaskList(params),
    }),
    queryClient.prefetchQuery({
      queryKey: attendanceFiltersKey,
      queryFn: () => loadAttendanceFilterOptions(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminTasksView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
