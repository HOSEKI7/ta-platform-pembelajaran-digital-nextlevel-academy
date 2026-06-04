import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminUsersPage } from "@/lib/admin-users-loader";
import {
  parsePage,
  parseRole,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-users-query";
import { createManagedUser } from "@/lib/admin-user-write";
import { createUserSchema } from "@/lib/validations/admin-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users — paginated, filterable, sortable user list for the
 * admin User Management table (PRD §6.11.4). Gated to ADMINISTRATOR.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const data = await loadAdminUsersPage({
      page: parsePage(searchParams.get("page")),
      role: parseRole(searchParams.get("role")),
      status: parseStatus(searchParams.get("status")),
      search: parseSearch(searchParams.get("search")),
      sort: parseSort(searchParams.get("sort")),
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/users GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar pengguna." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/users — create an admin-managed account (PRD §6.11.4).
 * Roles allowed: Peserta Didik, Peserta Magang, Mentor. Magang/Mentor require a
 * Class; Magang enforces the per-class quota. Returns the new user id.
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const result = await createManagedUser({
    role: parsed.data.role,
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    classId: parsed.data.classId,
    institution: parsed.data.institution ?? null,
    gender: parsed.data.gender ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
