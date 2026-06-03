import { NextResponse } from "next/server";
import { z } from "zod";

import { NotificationType, Role, SubmissionStatus } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  feedbackText: z
    .string()
    .trim()
    .min(1, "Catatan feedback wajib diisi.")
    .max(2000, "Catatan terlalu panjang."),
});

/**
 * POST /api/mentor/tasks/[taskId]/submissions/[studentId]/return
 *
 * Return a SUBMITTED assignment to the student for revision (PRD §6.9.3): write
 * the mentor's note, flip the submission back to NOT_SUBMITTED, and notify the
 * student. Class-scoped to the mentor; the kept file lets the student see what
 * they turned in while they revise.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ taskId: string; studentId: string }> },
) {
  const auth = await requireRoleInRoute(Role.MENTOR);
  if (auth instanceof Response) return auth;

  const { taskId, studentId } = await ctx.params;

  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: auth.user.id },
    select: { classId: true },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Anda belum ditugaskan ke kelas mana pun." },
      { status: 404 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  // Task must belong to the mentor's class.
  const task = await prisma.task.findFirst({
    where: { id: taskId, classId: profile.classId },
    select: { id: true, title: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }

  // Submission must exist and currently be SUBMITTED to be returnable.
  const submission = await prisma.taskSubmission.findUnique({
    where: { taskId_studentId: { taskId, studentId } },
    select: { id: true, status: true },
  });
  if (!submission || submission.status !== SubmissionStatus.SUBMITTED) {
    return NextResponse.json(
      { error: "Hanya tugas yang sudah dikumpulkan yang dapat dikembalikan." },
      { status: 409 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.taskSubmission.update({
        where: { taskId_studentId: { taskId, studentId } },
        data: {
          status: SubmissionStatus.NOT_SUBMITTED,
          feedbackText: parsed.data.feedbackText,
          reviewedAt: new Date(),
        },
      });
      await tx.notification.create({
        data: {
          userId: studentId,
          type: NotificationType.TASK_FEEDBACK,
          title: "Tugas dikembalikan",
          message: `Mentor mengembalikan tugas "${task.title}". Baca feedback-nya di halaman detail tugas, lalu kumpulkan revisimu.`,
          refId: task.id,
        },
      });
    });
  } catch (err) {
    console.error("[mentor/tasks return] db write failed", err);
    return NextResponse.json(
      { error: "Gagal mengembalikan tugas. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
