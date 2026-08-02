import { cookies } from "next/headers";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMagangContext } from "@/lib/internship-data-loader";

import { InternshipShell } from "@/components/internship/internship-shell";
import "./internship.css";

const COLLAPSED_COOKIE = "internship-sidebar-collapsed";

export default async function InternshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole internship surface to PESERTA_MAGANG. Wrong role → "/".
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/dashboard",
  });

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(COLLAPSED_COOKIE)?.value === "1";
  const bundle = await loadMagangContext(session.user.id);

  return (
    <InternshipShell
      user={{
        name: session.user.name,
        email: session.user.email,
        username: session.user.username ?? null,
        image: session.user.image ?? null,
      }}
      context={bundle?.context ?? null}
      initialCollapsed={initialCollapsed}
    >
      {children}
    </InternshipShell>
  );
}
