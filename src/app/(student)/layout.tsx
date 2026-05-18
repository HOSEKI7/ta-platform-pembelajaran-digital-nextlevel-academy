import { cookies } from "next/headers";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const COLLAPSED_COOKIE = "student-sidebar-collapsed";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/dashboard",
  });

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(COLLAPSED_COOKIE)?.value === "1";

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        username: session.user.username ?? null,
        image: session.user.image ?? null,
      }}
      initialCollapsed={initialCollapsed}
    >
      {children}
    </DashboardShell>
  );
}
