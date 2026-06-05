import { NextResponse } from "next/server";
import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { canManageAdmins } from "@/lib/admin-permissions";
import { setAdminActive } from "@/lib/admin-invite-write";

export const runtime = "nodejs";

const bodySchema = z.object({ isActive: z.boolean() });

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ userId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;
  if (!canManageAdmins(auth.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const result = await setAdminActive(userId, parsed.data.isActive, auth.user.id, {
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: { isActive: parsed.data.isActive } });
}
