import { NextResponse } from "next/server";

import { acceptAdminInvite } from "@/lib/admin-invite-write";
import {
  adminInviteAcceptRateLimiter,
  consumeRateLimit,
  tooManyRequestsResponse,
} from "@/lib/rate-limit";
import { acceptInviteSchema } from "@/lib/validations/admin-invite";

export const runtime = "nodejs";

/**
 * Public (no session) endpoint where an invited user sets their own name +
 * password to create their ADMINISTRATOR account. Keyed by IP for rate limiting
 * since token guessing is the abuse vector. Lives under /api/admin-invite (not
 * /api/admin) so it is outside the admin auth surface.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = await consumeRateLimit(adminInviteAcceptRateLimiter, ip);
  if (!limit.allowed) return tooManyRequestsResponse(limit.retryAfterSec);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = acceptInviteSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const result = await acceptAdminInvite({
    token: parsed.data.token,
    name: parsed.data.name,
    password: parsed.data.password,
    ip,
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: { ok: true, email: result.email } }, { status: 201 });
}
