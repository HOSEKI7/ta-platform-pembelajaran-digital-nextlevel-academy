import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { deleteBunnyVideo } from "@/lib/bunny-stream-admin";
import { sprintSchema } from "@/lib/validations/admin-course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/sprints/[sprintId] — rename a sprint. */
export async function PATCH(req: Request, ctx: { params: Promise<{ sprintId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { sprintId } = await ctx.params;

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

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: { id: true },
  });
  if (!sprint) {
    return NextResponse.json({ error: "Sprint tidak ditemukan." }, { status: 404 });
  }

  try {
    await prisma.sprint.update({
      where: { id: sprintId },
      data: { title: parsed.data.title },
    });
    return NextResponse.json({ data: { id: sprintId } });
  } catch (err) {
    console.error("[admin/sprints PATCH] failed", err);
    return NextResponse.json({ error: "Gagal memperbarui sprint." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/sprints/[sprintId] — delete a sprint and all its steps
 * (cascade). Bunny videos belonging to the sprint's video steps are deleted
 * best-effort first so they don't leak on the CDN.
 */
export async function DELETE(_req: Request, ctx: { params: Promise<{ sprintId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { sprintId } = await ctx.params;

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: {
      id: true,
      steps: { select: { video: { select: { bunnyVideoId: true } } } },
    },
  });
  if (!sprint) {
    return NextResponse.json({ error: "Sprint tidak ditemukan." }, { status: 404 });
  }

  try {
    await prisma.sprint.delete({ where: { id: sprintId } });
  } catch (err) {
    console.error("[admin/sprints DELETE] failed", err);
    return NextResponse.json({ error: "Gagal menghapus sprint." }, { status: 500 });
  }

  // Best-effort Bunny cleanup (after the DB row is gone).
  for (const step of sprint.steps) {
    if (step.video?.bunnyVideoId) {
      deleteBunnyVideo(step.video.bunnyVideoId).catch(() => {});
    }
  }

  return NextResponse.json({ data: { ok: true } });
}
