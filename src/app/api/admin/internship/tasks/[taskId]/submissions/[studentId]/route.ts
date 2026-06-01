import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  describeSubmissionFailure,
  setSubmissionStatus,
} from "@/lib/admin-task-submission-write";
import { setSubmissionStatusSchema } from "@/lib/validations/admin-task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/internship/tasks/[taskId]/submissions/[studentId]
 * body: { status: "SUBMITTED" | "NOT_SUBMITTED" }
 *
 * Admin force-override of a student's submission status (PRD §6.11 / §6.9.3).
 * Writes the row + an AuditLog entry; no student notification. All gating is
 * server-side (task exists, student belongs to the task's class).
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ taskId: string; studentId: string }> },
) {
  try {
    const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
    if (auth instanceof Response) return auth;

    const { taskId, studentId } = await ctx.params;

    const body = await req.json().catch(() => null);
    const parsed = setSubmissionStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Permintaan tidak valid." },
        { status: 400 },
      );
    }

    const result = await setSubmissionStatus({
      taskId,
      studentId,
      target: parsed.data.status,
      actorId: auth.user.id,
    });

    if (!result.ok) {
      const { status, error } = describeSubmissionFailure(result);
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error("[admin/internship/tasks submissions][PATCH]", err);
    return NextResponse.json(
      { error: "Gagal menyimpan status pengumpulan." },
      { status: 500 },
    );
  }
}
