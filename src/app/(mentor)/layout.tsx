import { cookies } from "next/headers";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorContext } from "@/lib/mentor-data-loader";

import { MentorShell } from "@/components/mentor/mentor-shell";

const COLLAPSED_COOKIE = "mentor-sidebar-collapsed";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole mentor surface to MENTOR. Wrong role → "/".
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/dashboard",
  });

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(COLLAPSED_COOKIE)?.value === "1";
  const bundle = await loadMentorContext(session.user.id);

  return (
    <MentorShell
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
    </MentorShell>
  );
}
