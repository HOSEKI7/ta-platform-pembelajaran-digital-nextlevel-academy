import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { CreateVoucherView } from "@/components/admin/vouchers/create-voucher-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Voucher",
  description: "Buat kode voucher diskon baru.",
  robots: { index: false, follow: false },
};

export default async function NewVoucherPage() {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/vouchers/new" });

  return (
    <StudentPageContainer width="narrow">
      <CreateVoucherView />
    </StudentPageContainer>
  );
}
