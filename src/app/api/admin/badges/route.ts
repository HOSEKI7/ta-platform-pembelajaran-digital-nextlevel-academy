import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminBadgesPage } from "@/lib/admin-badges-loader";
import {
  parsePage,
  parseSearch,
  parseTrigger,
} from "@/lib/admin-badges-query";
import { createBadge, describeBadgeFailure } from "@/lib/admin-badge-write";
import { badgeFormSchema } from "@/lib/validations/admin-badge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/badges — paginated, searchable, trigger-filterable badge list
 * (PRD §6.11.8). Gated to ADMINISTRATOR.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const data = await loadAdminBadgesPage({
      page: parsePage(searchParams.get("page")),
      search: parseSearch(searchParams.get("search")),
      trigger: parseTrigger(searchParams.get("trigger")),
    });
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/badges GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar badge." },
      { status: 500 },
    );
  }
}

/** POST /api/admin/badges — create a new badge (PRD §6.11.8). */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = badgeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data badge tidak valid." },
      { status: 400 },
    );
  }

  const result = await createBadge(parsed.data, { actorId: auth.user.id });

  if (!result.ok) {
    const { status, error } = describeBadgeFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
