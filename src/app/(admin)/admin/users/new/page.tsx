import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadClassOptions } from "@/lib/admin-users-loader";

import { CreateUserView } from "@/components/admin/users/create-user-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tambah Pengguna",
  robots: { index: false, follow: false },
};

export default async function NewUserPage() {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/users/new" });

  const classOptions = await loadClassOptions();

  return (
    <StudentPageContainer width="wide">
      <CreateUserView classOptions={classOptions} />
    </StudentPageContainer>
  );
}
