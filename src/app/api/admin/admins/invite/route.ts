import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { canManageAdmins } from "@/lib/admin-permissions";
import { createAdminInvite } from "@/lib/admin-invite-write";
import {
  adminInviteRateLimiter,
  consumeRateLimit,
  tooManyRequestsResponse,
} from "@/lib/rate-limit";
import { inviteAdminSchema } from "@/lib/validations/admin-invite";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;
  if (!canManageAdmins(auth.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = await consumeRateLimit(adminInviteRateLimiter, auth.user.id);
  if (!limit.allowed) return tooManyRequestsResponse(limit.retryAfterSec);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = inviteAdminSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const result = await createAdminInvite({
    email: parsed.data.email,
    name: parsed.data.name || null,
    invitedById: auth.user.id,
    inviterName: auth.user.name,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // When no real email was sent (RESEND key unset / send failed), return the URL
  // so the inviting admin can deliver it manually. The admin is already
  // authorized to invite, so this exposes nothing they couldn't generate anyway.
  return NextResponse.json(
    {
      data: {
        id: result.inviteId,
        ...(result.emailDryRun ? { inviteUrl: result.inviteUrl } : {}),
      },
    },
    { status: 201 },
  );
}
