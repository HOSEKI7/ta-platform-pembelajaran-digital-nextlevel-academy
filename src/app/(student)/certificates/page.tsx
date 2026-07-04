import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadCertificateRows } from "@/lib/certificate-data-loader";
import { getQueryClient } from "@/lib/query-client";
import { studentKeys } from "@/lib/student-query-keys";
import { certificatesQuerySchema } from "@/lib/validators/certificates";

import { CertificatesView } from "@/components/dashboard/certificates/certificates-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sertifikat",
  description:
    "Klaim dan unduh sertifikat dari kursus yang sudah kamu selesaikan.",
  robots: { index: false, follow: false },
};

type SP = { sort?: string; pageSize?: string; page?: string };
type Props = { searchParams: Promise<SP> };

export default async function CertificatesPage({ searchParams }: Props) {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/certificates",
  });

  const sp = await searchParams;
  const parsed = certificatesQuerySchema.safeParse(sp);
  const filters = parsed.success
    ? parsed.data
    : { sort: "desc" as const, pageSize: 10 as const, page: 1 };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: studentKeys.certificates(filters),
    queryFn: () => loadCertificateRows(session.user.id, filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer>
        <CertificatesView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
