import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminVouchersPage } from "@/lib/admin-vouchers-loader";
import {
  type AdminVouchersParams,
  adminVouchersKey,
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-vouchers-query";

import { AdminVouchersView } from "@/components/admin/vouchers/admin-vouchers-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Voucher",
  description:
    "Kelola voucher diskon promosi — buat, edit, nonaktifkan, dan hapus kode voucher.",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  status?: string;
  sort?: string;
  search?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminVouchersPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/vouchers" });

  const sp = await searchParams;
  const params: AdminVouchersParams = {
    page: parsePage(sp.page),
    status: parseStatus(sp.status),
    sort: parseSort(sp.sort),
    search: parseSearch(sp.search),
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminVouchersKey(params),
    queryFn: () => loadAdminVouchersPage(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminVouchersView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
