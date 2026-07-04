import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadTransactionRows } from "@/lib/transaction-data-loader";
import { getQueryClient } from "@/lib/query-client";
import { studentKeys } from "@/lib/student-query-keys";
import { transactionsQuerySchema } from "@/lib/validators/transactions";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { TransactionsView } from "@/components/dashboard/transactions/transactions-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi",
  description: "Riwayat transaksi pembelian kursusmu di NextLevel Academy.",
  robots: { index: false, follow: false },
};

type SP = { sort?: string; pageSize?: string; page?: string };
type Props = { searchParams: Promise<SP> };

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/transactions",
  });

  const sp = await searchParams;
  const parsed = transactionsQuerySchema.safeParse(sp);
  const filters = parsed.success
    ? parsed.data
    : { sort: "desc" as const, pageSize: 10 as const, page: 1 };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: studentKeys.transactions(filters),
    queryFn: () => loadTransactionRows(session.user.id, filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer>
        <TransactionsView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
