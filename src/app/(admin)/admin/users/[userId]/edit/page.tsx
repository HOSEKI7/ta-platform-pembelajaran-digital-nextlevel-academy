import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadClassOptions, loadUserForEdit } from "@/lib/admin-users-loader";

import { EditUserView } from "@/components/admin/users/edit-user-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Pengguna",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ userId: string }> };

export default async function EditUserPage({ params }: Props) {
  const { userId } = await params;
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: `/admin/users/${userId}/edit`,
  });

  const [user, classOptions] = await Promise.all([
    loadUserForEdit(userId),
    loadClassOptions(),
  ]);
  if (!user) notFound();

  return (
    <StudentPageContainer width="wide">
      <EditUserView user={user} classOptions={classOptions} />
    </StudentPageContainer>
  );
}
