import { NextResponse } from "next/server";
import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { markAdminNavSeen } from "@/lib/admin-nav-indicators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  scope: z.enum(["users", "transactions"]),
});

/**
 * POST /api/admin/notifications/indicators/seen
 * → marks an admin menu (users | transactions) as seen now, clearing its dot
 * for all admins (PRD §6.11). Called on entry to the corresponding list page.
 */
export async function POST(req: Request) {
  const session = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (session instanceof Response) return session;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Scope tidak valid." }, { status: 400 });
  }

  try {
    await markAdminNavSeen(parsed.data.scope, session.user.id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error("[POST /api/admin/notifications/indicators/seen]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
