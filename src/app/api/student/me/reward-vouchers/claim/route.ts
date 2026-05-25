import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { claimRewardVoucher, GamificationError } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { claimRewardSchema } from "@/lib/validators/rewards";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/me/reward-vouchers/claim
 *
 * Body: `{ targetLevel: 5 | 10 | 15 }`
 *
 * Issues the reward voucher for the milestone level the student has reached
 * (PRD §6.7.4). Idempotent — claiming again returns the existing voucher
 * instead of creating a duplicate. Returns 403 if the student hasn't reached
 * the level yet.
 */
export async function POST(req: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid." }, { status: 400 });
  }

  const parsed = claimRewardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 },
    );
  }

  try {
    const data = await prisma.$transaction((tx) =>
      claimRewardVoucher(tx, session.user.id, parsed.data.targetLevel),
    );
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    if (err instanceof GamificationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/student/me/reward-vouchers/claim]", err);
    return NextResponse.json(
      { error: "Gagal mengklaim voucher reward." },
      { status: 500 },
    );
  }
}
