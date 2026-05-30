import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import {
  loadAdminCertificatesPage,
  loadCertificateCourseOptions,
  loadCertificateExpirySetting,
} from "@/lib/admin-certificates-loader";
import {
  type AdminCertificatesParams,
  adminCertificatesKey,
  parseCourseId,
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-certificates-query";

import { AdminCertificatesView } from "@/components/admin/certificates/admin-certificates-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Sertifikat",
  description:
    "Pantau seluruh sertifikat yang telah diterbitkan dan atur masa berlaku global.",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  status?: string;
  sort?: string;
  search?: string;
  courseId?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminCertificatesPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/certificates" });

  const sp = await searchParams;
  const params: AdminCertificatesParams = {
    page: parsePage(sp.page),
    status: parseStatus(sp.status),
    sort: parseSort(sp.sort),
    search: parseSearch(sp.search),
    courseId: parseCourseId(sp.courseId),
  };

  const queryClient = getQueryClient();
  const [courseOptions, expiry] = await Promise.all([
    loadCertificateCourseOptions(),
    loadCertificateExpirySetting(),
    queryClient.prefetchQuery({
      queryKey: adminCertificatesKey(params),
      queryFn: () => loadAdminCertificatesPage(params),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminCertificatesView courseOptions={courseOptions} expiry={expiry} />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
