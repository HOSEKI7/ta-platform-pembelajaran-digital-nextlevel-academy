import { NextResponse } from "next/server";

import { Prisma, Role, VideoStatus } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { deleteBunnyVideo } from "@/lib/bunny-stream-admin";
import { quizStepSchema, videoStepSchema } from "@/lib/validations/admin-course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/steps/[stepId] — edit a VIDEO or QUIZ step (PRD §6.11.3).
 * Replacing a video file (new `bunnyVideoId`) points the step at the new asset
 * and **immediately deletes the old Bunny video** to reclaim storage (user
 * decision — overrides the PRD's 7-day VideoArchive buffer; no rollback kept).
 * Quiz questions are replaced wholesale.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ stepId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { stepId } = await ctx.params;

  const step = await prisma.step.findUnique({
    where: { id: stepId },
    select: {
      id: true,
      type: true,
      video: { select: { id: true, bunnyVideoId: true } },
      quiz: { select: { id: true } },
    },
  });
  if (!step) {
    return NextResponse.json({ error: "Tahap tidak ditemukan." }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }

  try {
    if (step.type === "VIDEO") {
      const parsed = videoStepSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
          { status: 400 },
        );
      }
      const { title, description, bunnyVideoId } = parsed.data;
      const replacing =
        step.video && step.video.bunnyVideoId !== bunnyVideoId ? step.video : null;

      await prisma.$transaction(async (tx) => {
        await tx.step.update({ where: { id: stepId }, data: { title, description } });
        if (replacing) {
          // Point the step at the freshly uploaded asset (re-enters PROCESSING
          // until the Bunny webhook reports the new encoding as READY).
          await tx.video.update({
            where: { id: replacing.id },
            data: {
              bunnyVideoId,
              status: VideoStatus.PROCESSING,
              duration: 0,
              videoUrl: null,
            },
          });
        }
      });

      // After the swap is committed, delete the old Bunny asset to reclaim
      // storage automatically (best-effort; never blocks the response).
      if (replacing) {
        deleteBunnyVideo(replacing.bunnyVideoId).catch(() => {});
      }

      return NextResponse.json({ data: { id: stepId } });
    }

    // QUIZ
    const parsed = quizStepSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 },
      );
    }
    if (!step.quiz) {
      return NextResponse.json({ error: "Data quiz tidak ditemukan." }, { status: 404 });
    }
    const { title, description, passingScore, questions } = parsed.data;
    const quizId = step.quiz.id;

    await prisma.$transaction([
      prisma.step.update({ where: { id: stepId }, data: { title, description } }),
      prisma.quiz.update({ where: { id: quizId }, data: { passingScore } }),
      prisma.quizQuestion.deleteMany({ where: { quizId } }),
      prisma.quizQuestion.createMany({
        data: questions.map((q, i) => ({
          quizId,
          question: q.question || null,
          questionImageUrl: q.questionImageUrl || null,
          options: q.options as Prisma.InputJsonValue,
          answer: q.answer,
          order: i,
        })),
      }),
    ]);
    return NextResponse.json({ data: { id: stepId } });
  } catch (err) {
    console.error("[admin/steps PATCH] failed", err);
    return NextResponse.json({ error: "Gagal memperbarui tahap." }, { status: 500 });
  }
}

/** DELETE /api/admin/steps/[stepId] — delete a step (cascade video/quiz). */
export async function DELETE(_req: Request, ctx: { params: Promise<{ stepId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { stepId } = await ctx.params;

  const step = await prisma.step.findUnique({
    where: { id: stepId },
    select: { id: true, video: { select: { bunnyVideoId: true } } },
  });
  if (!step) {
    return NextResponse.json({ error: "Tahap tidak ditemukan." }, { status: 404 });
  }

  try {
    await prisma.step.delete({ where: { id: stepId } });
  } catch (err) {
    console.error("[admin/steps DELETE] failed", err);
    return NextResponse.json({ error: "Gagal menghapus tahap." }, { status: 500 });
  }

  if (step.video?.bunnyVideoId) {
    deleteBunnyVideo(step.video.bunnyVideoId).catch(() => {});
  }

  return NextResponse.json({ data: { ok: true } });
}
