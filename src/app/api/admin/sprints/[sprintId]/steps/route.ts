import { NextResponse } from "next/server";

import { Prisma, Role, StepType, VideoStatus } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { quizStepSchema, videoStepSchema } from "@/lib/validations/admin-course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/sprints/[sprintId]/steps — add a VIDEO or QUIZ step to a
 * sprint (PRD §6.11.3). The video file is already uploaded to Bunny via TUS, so
 * the body only carries its `bunnyVideoId`; the Video row starts PROCESSING and
 * flips to READY via the Bunny webhook. Quiz questions are stored inline.
 */
export async function POST(req: Request, ctx: { params: Promise<{ sprintId: string }> }) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { sprintId } = await ctx.params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const type = (raw as { type?: string } | null)?.type;
  if (type !== "VIDEO" && type !== "QUIZ") {
    return NextResponse.json({ error: "Tipe tahap tidak valid." }, { status: 400 });
  }

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: { id: true },
  });
  if (!sprint) {
    return NextResponse.json({ error: "Sprint tidak ditemukan." }, { status: 404 });
  }

  const last = await prisma.step.aggregate({
    where: { sprintId },
    _max: { order: true },
  });
  const order = (last._max.order ?? -1) + 1;

  try {
    if (type === "VIDEO") {
      const parsed = videoStepSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
          { status: 400 },
        );
      }
      const { title, description, bunnyVideoId } = parsed.data;
      const step = await prisma.step.create({
        data: {
          sprintId,
          title,
          description,
          type: StepType.VIDEO,
          order,
          video: {
            create: { bunnyVideoId, duration: 0, status: VideoStatus.PROCESSING },
          },
        },
        select: { id: true },
      });
      return NextResponse.json({ data: { id: step.id } }, { status: 201 });
    }

    const parsed = quizStepSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 },
      );
    }
    const { title, description, passingScore, questions } = parsed.data;
    const step = await prisma.step.create({
      data: {
        sprintId,
        title,
        description,
        type: StepType.QUIZ,
        order,
        quiz: {
          create: {
            passingScore,
            questions: {
              create: questions.map((q, i) => ({
                question: q.question || null,
                questionImageUrl: q.questionImageUrl || null,
                options: q.options as Prisma.InputJsonValue,
                answer: q.answer,
                order: i,
              })),
            },
          },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ data: { id: step.id } }, { status: 201 });
  } catch (err) {
    console.error("[admin/steps POST] failed", err);
    return NextResponse.json({ error: "Gagal menambah tahap." }, { status: 500 });
  }
}
