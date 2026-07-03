import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import {
  loadAdminVoucherForEdit,
  loadAdminVoucherFormOptions,
} from "@/lib/admin-vouchers-loader";

import { EditVoucherView } from "@/components/admin/vouchers/edit-voucher-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Voucher",
  description: "Perbarui, nonaktifkan, atau hapus voucher.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ voucherId: string }> };

export default async function EditVoucherPage({ params }: Props) {
  const { voucherId } = await params;
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: `/admin/vouchers/${voucherId}/edit`,
  });

  const [voucher, { courses, categories }] = await Promise.all([
    loadAdminVoucherForEdit(voucherId),
    loadAdminVoucherFormOptions(),
  ]);
  if (!voucher) notFound();

  return (
    <StudentPageContainer width="narrow">
      <EditVoucherView
        voucher={voucher}
        courses={courses}
        categories={categories}
      />
    </StudentPageContainer>
  );
}
