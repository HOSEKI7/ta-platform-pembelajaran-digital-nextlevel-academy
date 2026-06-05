import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  // Force a password change before any admin page is reachable — covers the
  // first login after a bootstrapped admin (env-provided temporary password).
  // The /ganti-password page lives outside the role route-groups (PRD §6.11.4).
  if (session.user.mustChangePassword) {
    redirect("/ganti-password");
  }

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
