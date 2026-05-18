import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadStudentCatalogPage } from "@/lib/student-catalog-loader";
import { studentCatalogQuerySchema } from "@/lib/validators/student-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const parsed = studentCatalogQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  try {
    const data = await loadStudentCatalogPage(session.user.id, parsed.data);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/student/catalog]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
