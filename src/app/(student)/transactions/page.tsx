import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { TransactionsView } from "@/components/dashboard/transactions/transactions-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi",
  description: "Riwayat transaksi pembelian kursusmu di NextLevel Academy.",
  robots: { index: false, follow: false },
};

export default async function TransactionsPage() {
  await requireRole(Role.PESERTA_DIDIK, { redirectTo: "/transactions" });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <TransactionsView />
    </div>
  );
}
