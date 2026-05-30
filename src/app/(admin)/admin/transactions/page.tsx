import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminTransactionsPage } from "@/lib/admin-transactions-loader";
import {
  type AdminTransactionsParams,
  adminTransactionsKey,
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-transactions-query";

import { AdminTransactionsView } from "@/components/admin/transactions/admin-transactions-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Transaksi",
  description:
    "Pantau seluruh transaksi pembelian kursus — terima/batalkan pembayaran tertunda dan unduh bukti transaksi.",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  status?: string;
  sort?: string;
  search?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminTransactionsPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/transactions" });

  const sp = await searchParams;
  const params: AdminTransactionsParams = {
    page: parsePage(sp.page),
    status: parseStatus(sp.status),
    sort: parseSort(sp.sort),
    search: parseSearch(sp.search),
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminTransactionsKey(params),
    queryFn: () => loadAdminTransactionsPage(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminTransactionsView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
