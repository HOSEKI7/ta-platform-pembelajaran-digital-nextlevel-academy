import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminAccounts } from "@/lib/admin-accounts-loader";
import { adminAccountsKey } from "@/lib/admin-accounts-query";

import { AdminAccountsView } from "@/components/admin/admins/admin-accounts-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Akun Administrator",
  description: "Undang dan kelola akun administrator platform.",
  robots: { index: false, follow: false },
};

export default async function AdminAccountsPage() {
  const session = await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/admins",
  });

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminAccountsKey,
    queryFn: () => loadAdminAccounts(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <AdminAccountsView currentAdminId={session.user.id} />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
