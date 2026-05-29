import { cookies } from "next/headers";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { AdminShell } from "@/components/admin/admin-shell";

const COLLAPSED_COOKIE = "admin-sidebar-collapsed";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole admin surface to ADMINISTRATOR. Wrong role → "/".
  const session = await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/dashboard",
  });

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(COLLAPSED_COOKIE)?.value === "1";

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        username: session.user.username ?? null,
        image: session.user.image ?? null,
      }}
      initialCollapsed={initialCollapsed}
    >
      {children}
    </AdminShell>
  );
}
