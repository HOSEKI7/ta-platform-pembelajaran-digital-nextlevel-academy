import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadTransactionRows } from "@/lib/transaction-data-loader";
import { getQueryClient } from "@/lib/query-client";
import { studentKeys } from "@/lib/student-query-keys";

import { TransactionsView } from "@/components/dashboard/transactions/transactions-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi",
  description: "Riwayat transaksi pembelian kursusmu di NextLevel Academy.",
  robots: { index: false, follow: false },
};

export default async function TransactionsPage() {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/transactions",
  });

  const defaultFilters = {
    sort: "desc" as const,
    pageSize: 10 as const,
    page: 1,
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: studentKeys.transactions(defaultFilters),
    queryFn: () => loadTransactionRows(session.user.id, defaultFilters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <TransactionsView />
      </div>
    </HydrationBoundary>
  );
}
