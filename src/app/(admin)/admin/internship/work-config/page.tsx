import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadHolidayConfig } from "@/lib/admin-internship-holiday-loader";
import { holidayConfigKey } from "@/lib/admin-internship-holiday-query";

import { WorkConfigView } from "@/components/admin/internship/work-config/work-config-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Konfigurasi Jam Kerja & Libur · Admin",
  description: "Kelola tanggal libur program magang.",
  robots: { index: false, follow: false },
};

export default async function AdminInternshipWorkConfigPage() {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/internship/work-config" });

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: holidayConfigKey,
    queryFn: () => loadHolidayConfig(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <WorkConfigView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
