import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/**
 * Gamifikasi was split into two dedicated surfaces (Aturan EXP & Manajemen Badge,
 * PRD §6.11.8). This index just lands the user on the first sub-page.
 */
export default async function AdminGamificationIndexPage() {
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/gamification/exp-rules",
  });
  redirect("/admin/gamification/exp-rules");
}
