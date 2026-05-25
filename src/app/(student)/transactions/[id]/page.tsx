import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadTransactionDetail } from "@/lib/transaction-data-loader";

import { TransactionDetailView } from "@/components/dashboard/transactions/transaction-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Transaksi",
  description: "Rincian pembayaran dan status transaksi pembelian kursus.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function TransactionDetailPage({ params }: Props) {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/transactions",
  });

  const { id } = await params;
  const tx = await loadTransactionDetail(session.user.id, id);
  if (!tx) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <TransactionDetailView tx={tx} />
    </div>
  );
}
