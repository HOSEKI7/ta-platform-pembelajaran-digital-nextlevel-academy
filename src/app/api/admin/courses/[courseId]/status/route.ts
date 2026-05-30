import { NextResponse } from "next/server";

import { CourseStatus, Role, VideoStatus } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { statusUpdateSchema } from "@/lib/validations/admin-course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/courses/[courseId]/status — change a course's lifecycle
 * status (PRD §6.11.3 / §6.11.3.2). Publishing runs the "Validasi Sebelum
 * Publish" gate and returns a specific error if anything is incomplete.
 * `publishedAt` is stamped on the first transition to PUBLISHED.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { courseId } = await ctx.params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = statusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }
  const target = parsed.data.status as CourseStatus;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnailUrl: true,
      status: true,
      publishedAt: true,
      sprints: {
        orderBy: { order: "asc" },
        select: {
          title: true,
          steps: {
            select: {
              type: true,
              video: { select: { bunnyVideoId: true, status: true } },
              quiz: { select: { _count: { select: { questions: true } } } },
            },
          },
        },
      },
    },
  });
  if (!course) {
    return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
  }

  // Publish gate (PRD §6.11.3 "Validasi Sebelum Publish").
  if (target === CourseStatus.PUBLISHED) {
    const errors: string[] = [];
    if (!course.title.trim()) errors.push("judul");
    if (!course.description.trim()) errors.push("deskripsi");
    if (course.price < 0) errors.push("harga");
    if (!course.thumbnailUrl.trim()) errors.push("thumbnail");
    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Lengkapi dulu: ${errors.join(", ")} kursus sebelum publish.` },
        { status: 400 },
      );
    }
    if (course.sprints.length === 0) {
      return NextResponse.json(
        { error: "Kursus harus memiliki minimal satu sprint." },
        { status: 400 },
      );
    }
    for (const [i, sprint] of course.sprints.entries()) {
      const label = sprint.title || `Sprint ${i + 1}`;
      if (sprint.steps.length === 0) {
        return NextResponse.json(
          { error: `Sprint "${label}" belum memiliki tahap.` },
          { status: 400 },
        );
      }
      for (const step of sprint.steps) {
        if (step.type === "VIDEO") {
          if (!step.video?.bunnyVideoId) {
            return NextResponse.json(
              { error: `Ada tahap video di "${label}" yang belum punya file video.` },
              { status: 400 },
            );
          }
          if (step.video.status === VideoStatus.FAILED) {
            return NextResponse.json(
              { error: `Tahap video di "${label}" gagal diproses — unggah ulang.` },
              { status: 400 },
            );
          }
        } else if (step.type === "QUIZ") {
          if ((step.quiz?._count.questions ?? 0) === 0) {
            return NextResponse.json(
              { error: `Ada quiz di "${label}" yang belum punya soal.` },
              { status: 400 },
            );
          }
        }
      }
    }
  }

  try {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: target,
        // Stamp publishedAt only on the first ever publish.
        ...(target === CourseStatus.PUBLISHED && !course.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
      select: { status: true },
    });
    return NextResponse.json({ data: { status: updated.status } });
  } catch (err) {
    console.error("[admin/courses/status PATCH] failed", err);
    return NextResponse.json({ error: "Gagal mengubah status kursus." }, { status: 500 });
  }
}
