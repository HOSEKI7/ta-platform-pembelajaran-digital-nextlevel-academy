import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { ForcePasswordChangeForm } from "@/components/account/force-password-change-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ganti Password",
  robots: { index: false, follow: false },
};

/**
 * Forced password-change gate. Reached when a user logs in with an admin-issued
 * temporary password. Lives OUTSIDE the role route-groups so it is not itself
 * guarded by the student layout (which redirects here). The flag is read from
 * the DB (not the possibly-stale cookie-cached session).
 */
export default async function GantiPasswordPage() {
  const session = await requireAuth({ redirectTo: "/ganti-password" });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true, name: true },
  });
  if (!user?.mustChangePassword) redirect("/");

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 py-10">
      <ForcePasswordChangeForm userName={user.name} />
    </main>
  );
}
