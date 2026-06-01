import "server-only";

import { prisma } from "@/lib/prisma";
import { SubmissionStatus } from "@/generated/prisma";
import type { ForceSubmissionStatus } from "@/lib/admin-internship-tasks-query";

/**
 * Admin force-override of one student's submission status for one task
 * (PRD §6.11 / §6.9.3). The admin can flip a row to SUBMITTED or NOT_SUBMITTED
 * regardless of whether the student actually uploaded anything — this is an
 * administrative correction, distinct from the mentor "return for revision".
 *
 * Decisions (see CLAUDE.md session history):
 * - Force NOT_SUBMITTED is **non-destructive**: the uploaded file is kept
 *   (`submissionUrl` untouched) so it can be restored by flipping back. Stale
 *   `feedbackText`/`reviewedAt` are cleared so the student sees a clean "BELUM"
 *   rather than "DIKEMBALIKAN".
 * - Force SUBMITTED stamps `submittedAt = now` (only ever invoked on a
 *   NOT_SUBMITTED row via the UI toggle, so a genuine submit time is never
 *   overwritten) and clears any prior return feedback.
 * - No student notification — the change is recorded in `AuditLog` only.
 * - The student must belong to the task's own class (guards against orphan rows).
 */

export type SubmissionWriteFailure = "not_found" | "error";

export type SubmissionWriteResult =
  | { ok: true }
  | { ok: false; reason: SubmissionWriteFailure; detail?: string };

export type SetSubmissionArgs = {
  taskId: string;
  studentId: string;
  target: ForceSubmissionStatus;
  actorId: string;
};

export async function setSubmissionStatus(
  args: SetSubmissionArgs,
): Promise<SubmissionWriteResult> {
  const { taskId, studentId, target, actorId } = args;

  // Task must exist; the student must be enrolled in that task's class.
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, classId: true },
  });
  if (!task) return { ok: false, reason: "not_found", detail: "Tugas tidak ditemukan." };

  const profile = await prisma.internshipProfile.findUnique({
    where: { userId: studentId },
    select: { classId: true },
  });
  if (!profile || profile.classId !== task.classId) {
    return {
      ok: false,
      reason: "not_found",
      detail: "Peserta tidak terdaftar di kelas tugas ini.",
    };
  }

  const now = new Date();
  const toSubmitted = target === "SUBMITTED";

  try {
    await prisma.$transaction([
      prisma.taskSubmission.upsert({
        where: { taskId_studentId: { taskId, studentId } },
        create: {
          taskId,
          studentId,
          status: toSubmitted
            ? SubmissionStatus.SUBMITTED
            : SubmissionStatus.NOT_SUBMITTED,
          // A forced submission with no upload keeps submissionUrl null.
          submittedAt: now,
        },
        update: {
          status: toSubmitted
            ? SubmissionStatus.SUBMITTED
            : SubmissionStatus.NOT_SUBMITTED,
          // Clear stale return-feedback either way so the derived status is clean.
          feedbackText: null,
          reviewedAt: null,
          // Stamp submit time only when forcing SUBMITTED; keep the existing file.
          ...(toSubmitted ? { submittedAt: now } : {}),
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId,
          action: "TASK_SUBMISSION_OVERRIDE",
          entityType: "TaskSubmission",
          entityId: `${taskId}:${studentId}`,
          metadata: { taskId, studentId, to: target },
        },
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[setSubmissionStatus] failed", err);
    return { ok: false, reason: "error" };
  }
}

/** Map a write failure to an HTTP status + user-facing message. */
export function describeSubmissionFailure(result: {
  reason: SubmissionWriteFailure;
  detail?: string;
}): { status: number; error: string } {
  switch (result.reason) {
    case "not_found":
      return { status: 404, error: result.detail ?? "Data tidak ditemukan." };
    case "error":
      return { status: 500, error: "Gagal menyimpan status pengumpulan. Coba lagi." };
  }
}
