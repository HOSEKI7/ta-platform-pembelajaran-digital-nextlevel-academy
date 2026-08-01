import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  describeGradeFailure,
  setAdminFinalGrade,
} from "@/lib/admin-final-grade-write";
import { adminFinalGradeSchema } from "@/lib/validations/admin-final-grade";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/internship/grades/[studentId]
 *
 * Admin override of an intern's final grade (PRD §6.11.9 / §6.9.4). A single
 * upsert handles both "Beri Nilai" and "Edit Nilai"; the responsible mentor
 * (`FinalGrade.mentorId`) is preserved, the admin is recorded as the editor,
 * the mandatory reason goes to the AuditLog, and the mentor is notified.
 */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ studentId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { studentId } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = adminFinalGradeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const { grade, reason, lockGrade } = parsed.data;
  const note = parsed.data.note?.trim() ? parsed.data.note.trim() : null;

  const result = await setAdminFinalGrade({
    studentId,
    grade,
    note,
    reason,
    lockGrade,
    actorId: auth.user.id,
  });
  if (!result.ok) {
    const { status, error } = describeGradeFailure(result);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}
