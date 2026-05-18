import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadMyCourses } from "@/lib/student-data-loader";
import { myCoursesQuerySchema } from "@/lib/validators/my-courses";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const parsed = myCoursesQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  try {
    const data = await loadMyCourses(session.user.id, parsed.data);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/student/my-courses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
