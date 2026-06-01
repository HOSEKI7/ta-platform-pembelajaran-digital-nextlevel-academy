import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { getWibYmd } from "@/components/internship/attendance/attendance-data";
import {
  loadAdminAttendanceByDate,
  loadAttendanceFilterOptions,
} from "@/lib/admin-internship-attendance-loader";
import {
  adminAttendanceKey,
  attendanceFiltersKey,
  parseId,
  parsePage,
  parseSearch,
  type AdminAttendanceParams,
} from "@/lib/admin-internship-attendance-query";

import { AdminAttendanceView } from "@/components/admin/internship/attendance/admin-attendance-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Absensi Peserta Magang · Admin",
  description:
    "Pantau dan koreksi kehadiran peserta magang lintas kelas pada tanggal terpilih.",
  robots: { index: false, follow: false },
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type SP = {
  date?: string;
  batch?: string;
  field?: string;
  class?: string;
  search?: string;
  page?: string;
};

export default async function AdminStudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/internship/student-attendance",
  });

  const sp = await searchParams;
  const t = getWibYmd(new Date().toISOString());
  const todayISO = `${t.year}-${String(t.month + 1).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
  const requested = sp.date && DATE_RE.test(sp.date) ? sp.date : todayISO;
  const dateISO = requested > todayISO ? todayISO : requested;

  const params: AdminAttendanceParams = {
    scope: "student",
    dateISO,
    batchId: parseId(sp.batch),
    fieldId: parseId(sp.field),
    classId: parseId(sp.class),
    search: parseSearch(sp.search),
    page: parsePage(sp.page),
  };

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: adminAttendanceKey(params),
      queryFn: () => loadAdminAttendanceByDate(params),
    }),
    queryClient.prefetchQuery({
      queryKey: attendanceFiltersKey,
      queryFn: () => loadAttendanceFilterOptions(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminAttendanceView scope="student" />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
