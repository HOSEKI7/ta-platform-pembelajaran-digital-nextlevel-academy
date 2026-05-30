import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAdminTransactionDetail } from "@/lib/admin-transactions-loader";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { AdminTransactionDetailView } from "@/components/admin/transactions/admin-transaction-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Transaksi",
  description:
    "Rincian pembayaran, aksi admin, dan log transaksi pembelian kursus.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ orderId: string }> };

export default async function AdminTransactionDetailPage({ params }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/transactions" });

  const { orderId } = await params;
  const detail = await loadAdminTransactionDetail(orderId);
  if (!detail) {
    notFound();
  }

  return (
    <StudentPageContainer width="narrow">
      <AdminTransactionDetailView detail={detail} />
    </StudentPageContainer>
  );
}
