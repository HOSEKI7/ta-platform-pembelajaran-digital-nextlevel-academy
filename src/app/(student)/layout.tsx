import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  // Admin-issued temporary password: force a change before any student page is
  // accessible (PRD §6.11.4). The /ganti-password route lives outside this
  // group, so it isn't caught by this guard.
  if (session.user.mustChangePassword) {
    redirect("/ganti-password");
  }

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
