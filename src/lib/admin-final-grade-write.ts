import "server-only";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";

/**
 * Admin override of one intern's final grade (PRD §6.11.9 / §6.9.4) — an
 * administrative emergency action, distinct from the mentor's own grading.
 *
 * Data-integrity decisions (see CLAUDE.md session history):
 * - `FinalGrade.mentorId` ALWAYS references the responsible mentor, never the
 *   admin. On a fresh grade (no prior row) it's resolved from the intern's class
 *   (`MentorProfile`, earliest by id — deterministic); on an existing row it's
 *   left untouched. A class with no mentor → the action is rejected.
 * - The admin is recorded as `lastEditedById` (the real actor of this edit).
 * - Every admin change requires a `reason`, stored ONLY in the AuditLog
 *   (`FINAL_GRADE_OVERRIDE`); `FinalGrade.note` stays the student-facing comment.
 * - The responsible mentor gets an informative in-app Notification (prev → new
 *   grade + reason). The upsert + notification + audit run in one transaction.
 */

export type GradeWriteFailure = "not_found" | "no_mentor" | "error";

export type GradeWriteResult =
  | { ok: true }
  | { ok: false; reason: GradeWriteFailure; detail?: string };

export type SetAdminFinalGradeArgs = {
  studentId: string;
  grade: number;
  note: string | null;
  reason: string;
  actorId: string;
  lockGrade: boolean;
};

export async function setAdminFinalGrade(
  args: SetAdminFinalGradeArgs,
): Promise<GradeWriteResult> {
  const { studentId, grade, note, reason, actorId, lockGrade } = args;

  // The subject must be an intern; capture their class to resolve a mentor.
  const profile = await prisma.internshipProfile.findUnique({
    where: { userId: studentId },
    select: {
      classId: true,
      user: { select: { name: true } },
    },
  });
  if (!profile) {
    return { ok: false, reason: "not_found", detail: "Peserta magang tidak ditemukan." };
  }

  // Existing grade row drives create-vs-update + which mentor to attribute.
  const existing = await prisma.finalGrade.findUnique({
    where: { studentId },
    select: { grade: true, mentorId: true },
  });

  let mentorId: string;
  if (existing) {
    // Never reassign the responsible mentor on an edit.
    mentorId = existing.mentorId;
  } else {
    // Fresh grade: attribute to the class's responsible mentor (deterministic).
    const mentor = await prisma.mentorProfile.findFirst({
      where: { classId: profile.classId },
      orderBy: { id: "asc" },
      select: { userId: true },
    });
    if (!mentor) {
      return {
        ok: false,
        reason: "no_mentor",
        detail: "Kelas peserta belum punya mentor penanggung jawab.",
      };
    }
    mentorId = mentor.userId;
  }

  const prevGrade = existing?.grade ?? null;
  const now = new Date();
  const prevLabel = prevGrade === null ? "belum dinilai" : String(prevGrade);
  const message =
    `Admin mengubah nilai akhir ${profile.user.name} dari ${prevLabel} menjadi ${grade}. ` +
    `Alasan: ${reason}`;

  const lockFields = lockGrade
    ? { isLocked: true, lockedById: actorId, lockedAt: now }
    : { isLocked: false, lockedById: null, lockedAt: null };

  try {
    await prisma.$transaction([
      prisma.finalGrade.upsert({
        where: { studentId },
        create: {
          studentId,
          mentorId,
          grade,
          note,
          gradedAt: now,
          lastEditedById: actorId,
          overrideReason: reason,
          ...lockFields,
        },
        // mentorId intentionally NOT updated — stays the responsible mentor.
        update: {
          grade,
          note,
          lastEditedById: actorId,
          overrideReason: reason,
          ...lockFields,
        },
      }),
      prisma.notification.create({
        data: {
          userId: mentorId,
          type: NotificationType.FINAL_GRADE_OVERRIDE,
          title: "Nilai akhir diubah admin",
          message,
          refId: studentId,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId,
          action: "FINAL_GRADE_OVERRIDE",
          entityType: "FinalGrade",
          entityId: studentId,
          metadata: { studentId, prevGrade, grade, note, reason, lockGrade },
        },
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[setAdminFinalGrade] failed", err);
    return { ok: false, reason: "error" };
  }
}

/** Map a write failure to an HTTP status + user-facing message. */
export function describeGradeFailure(result: {
  reason: GradeWriteFailure;
  detail?: string;
}): { status: number; error: string } {
  switch (result.reason) {
    case "not_found":
      return { status: 404, error: result.detail ?? "Data tidak ditemukan." };
    case "no_mentor":
      return {
        status: 409,
        error: result.detail ?? "Kelas peserta belum punya mentor penanggung jawab.",
      };
    case "error":
      return { status: 500, error: "Gagal menyimpan nilai. Coba lagi." };
  }
}
