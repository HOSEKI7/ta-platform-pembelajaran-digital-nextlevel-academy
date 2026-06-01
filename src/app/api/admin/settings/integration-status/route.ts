import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { checkIntegrations } from "@/lib/admin-integration-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — live connectivity probe for every external integration (PRD §6.11.11).
 * Never returns secret values; only a coarse per-service state.
 */
export async function GET() {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const data = await checkIntegrations();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/settings/integration-status GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memeriksa status integrasi." },
      { status: 500 },
    );
  }
}
