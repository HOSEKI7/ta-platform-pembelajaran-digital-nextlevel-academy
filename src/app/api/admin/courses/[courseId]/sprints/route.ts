import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { sprintSchema } from "@/lib/validations/admin-course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/courses/[courseId]/sprints — add a sprint to a course
 * (PRD §6.11.3 Manajemen Kurikulum). Order is appended (max + 1).
 */
export async function POST(req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { courseId } = await ctx.params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = sprintSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) {
    return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
  }

  try {
    const last = await prisma.sprint.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const sprint = await prisma.sprint.create({
      data: {
        courseId,
        title: parsed.data.title,
        order: (last._max.order ?? -1) + 1,
      },
      select: { id: true },
    });
    return NextResponse.json({ data: { id: sprint.id } }, { status: 201 });
  } catch (err) {
    console.error("[admin/sprints POST] failed", err);
    return NextResponse.json({ error: "Gagal menambah sprint." }, { status: 500 });
  }
}
