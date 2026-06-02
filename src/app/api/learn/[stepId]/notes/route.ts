import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { saveStepNoteSchema } from "@/lib/validations/step-note";

export const dynamic = "force-dynamic";

/**
 * POST /api/learn/[stepId]/notes
 *
 * Autosaves the authenticated student's personal note for a single step
 * (Course Player "Catatan" tab). Debounced on the client (~1.5s after typing
 * stops) and also flushed via `navigator.sendBeacon` on page unload — both
 * hit this one endpoint (sendBeacon only supports POST + cookies).
 *
 * Storage is one `StepNote` row per `(enrollmentId, stepId)`:
 *   - non-empty content -> upsert
 *   - empty content      -> delete the row (keeps the table clean)
 *
 * The enrollment is resolved server-side from `stepId -> sprint.courseId` +
 * the session user, so a student can never write to someone else's note.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> },
) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;
  const userId = session.user.id;

  const { stepId } = await params;
  if (!stepId || typeof stepId !== "string") {
    return NextResponse.json({ error: "stepId tidak valid." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = saveStepNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Catatan tidak valid." },
      { status: 400 },
    );
  }

  const content = parsed.data.content;

  try {
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      select: { id: true, sprint: { select: { courseId: true } } },
    });
    if (!step) {
      return NextResponse.json(
        { error: "Materi tidak ditemukan." },
        { status: 404 },
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: step.sprint.courseId } },
      select: { id: true },
    });
    if (!enrollment) {
      return NextResponse.json(
        { error: "Kamu belum terdaftar di kursus ini." },
        { status: 403 },
      );
    }

    if (content.trim().length === 0) {
      await prisma.stepNote.deleteMany({
        where: { enrollmentId: enrollment.id, stepId },
      });
      return NextResponse.json({ data: { saved: true, empty: true } });
    }

    await prisma.stepNote.upsert({
      where: {
        enrollmentId_stepId: { enrollmentId: enrollment.id, stepId },
      },
      create: { enrollmentId: enrollment.id, stepId, content },
      update: { content },
    });

    return NextResponse.json({ data: { saved: true, empty: false } });
  } catch (err) {
    console.error("[POST /api/learn/[stepId]/notes]", err);
    return NextResponse.json(
      { error: "Gagal menyimpan catatan." },
      { status: 500 },
    );
  }
}
