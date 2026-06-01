import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadInternshipConfig } from "@/lib/admin-internship-config-loader";
import { internshipConfigKey } from "@/lib/admin-internship-config-query";

import { InternshipConfigView } from "@/components/admin/internship/config/internship-config-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Konfigurasi Magang · Admin",
  description: "Kelola struktur program magang: Batch, Bidang, dan Kelas.",
  robots: { index: false, follow: false },
};

export default async function AdminInternshipConfigPage() {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/internship/config" });

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: internshipConfigKey,
    queryFn: () => loadInternshipConfig(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <InternshipConfigView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
