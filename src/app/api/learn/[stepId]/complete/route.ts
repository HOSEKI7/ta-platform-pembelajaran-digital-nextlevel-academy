import { NextResponse, after, type NextRequest } from "next/server";

import { ExpSource, Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  ensureCertificateIssued,
  generateAndStoreCertificateImage,
} from "@/lib/certificates/issue-certificate";
import { awardCompletionBadges, awardExp } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
// Certificate auto-issue renders a PNG (Satori + Sharp) — needs Node runtime.
export const runtime = "nodejs";

/** PRD §6.5.6 / §6.7.x — fixed EXP awards per source. */
const EXP_VIDEO_COMPLETE = 15;
const EXP_COURSE_COMPLETE = 600;

/**
 * POST /api/learn/[stepId]/complete
 *
 * Marks a VIDEO step as completed for the authenticated student's enrollment.
 * Triggered by EITHER:
 *   1. Manual click on the "Tandai Selesai" button in the player, or
 *   2. The video player firing `ended` / `timeupdate >= duration-1`.
 *
 * QUIZ steps must be completed via `/api/learn/[stepId]/quiz/submit` —
 * passing the quiz is what marks a QUIZ step complete. Submitting QUIZ
 * stepIds here returns 400.
 *
 * EXP/level handling is delegated to `awardExp()` (see `@/lib/gamification`),
 * which is idempotent per `(userId, source, refId)` and runs the level-up
 * cascade (level increment, `exp` reset to 0, LEVEL_REACHED badge awards).
 *
 * Side effects (atomic transaction):
 *   1. Upsert `StepProgress` -> isCompleted: true
 *   2. Award +15 VIDEO_COMPLETE EXP — first time only (+ level-up cascade)
 *   3. Recompute `Enrollment.progressPct`
 *   4. If 100% and not previously completed: award +600 COURSE_COMPLETE EXP,
 *      set `Enrollment.completedAt`, award completion badges
 *   5. Bump `Enrollment.lastAccessedAt`
 *
 * Response: `{ data: { progressPct, completedStepIds, totalExpAwarded, courseCompleted } }`
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> },
) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;
  const userId = session.user.id;

  const { stepId } = await params;
  if (!stepId || typeof stepId !== "string") {
    return NextResponse.json({ error: "stepId tidak valid." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const step = await tx.step.findUnique({
        where: { id: stepId },
        select: {
          id: true,
          type: true,
          sprint: { select: { courseId: true } },
        },
      });
      if (!step) {
        throw new HttpError(404, "Materi tidak ditemukan.");
      }
      // QUIZ steps must go through /api/learn/[stepId]/quiz/submit — the
      // score validation lives there. Refuse to mark a quiz "complete"
      // without a real submission.
      if (step.type === "QUIZ") {
        throw new HttpError(
          400,
          "Step kuis harus diselesaikan via /quiz/submit.",
        );
      }
      const courseId = step.sprint.courseId;

      const enrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true, completedAt: true },
      });
      if (!enrollment) {
        throw new HttpError(403, "Kamu belum terdaftar di kursus ini.");
      }

      // 1. Mark step as completed
      const now = new Date();
      await tx.stepProgress.upsert({
        where: { enrollmentId_stepId: { enrollmentId: enrollment.id, stepId } },
        create: {
          enrollmentId: enrollment.id,
          stepId,
          isCompleted: true,
          completedAt: now,
        },
        update: {
          isCompleted: true,
          completedAt: now,
        },
      });

      // 2. Award VIDEO_COMPLETE EXP — idempotent + level-up cascade.
      const { awarded: awardedStepExp } = await awardExp(tx, {
        userId,
        amount: EXP_VIDEO_COMPLETE,
        source: ExpSource.VIDEO_COMPLETE,
        refId: stepId,
      });

      // 3. Recompute progress
      const [totalSteps, completedSteps, completedRows] = await Promise.all([
        tx.step.count({ where: { sprint: { courseId } } }),
        tx.stepProgress.count({
          where: { enrollmentId: enrollment.id, isCompleted: true },
        }),
        tx.stepProgress.findMany({
          where: { enrollmentId: enrollment.id, isCompleted: true },
          select: { stepId: true },
        }),
      ]);

      const progressPct =
        totalSteps === 0
          ? 0
          : Math.round((completedSteps / totalSteps) * 1000) / 10;

      // 4. Course completion bonus (idempotent via awardExp)
      const isCourseComplete = totalSteps > 0 && completedSteps === totalSteps;
      let courseCompleted = false;
      let awardedCourseExp = 0;

      if (isCourseComplete && !enrollment.completedAt) {
        const courseAward = await awardExp(tx, {
          userId,
          amount: EXP_COURSE_COMPLETE,
          source: ExpSource.COURSE_COMPLETE,
          refId: courseId,
        });
        awardedCourseExp = courseAward.awarded;
        // awarded === 0 means the bonus was already granted earlier.
        courseCompleted = courseAward.awarded > 0;
      }

      // 5. Update enrollment (progress + access timestamp + maybe completedAt)
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPct,
          lastAccessedAt: now,
          ...(courseCompleted ? { completedAt: now } : {}),
        },
      });

      // 6. Completion badges — after completedAt is set so the count includes
      //    this course (COURSES_COMPLETED + COURSE_SPECIFIC triggers).
      if (courseCompleted) {
        await awardCompletionBadges(tx, userId, courseId);
      }

      return {
        progressPct,
        completedStepIds: completedRows.map((r) => r.stepId),
        totalExpAwarded: awardedStepExp + awardedCourseExp,
        courseCompleted,
        enrollmentId: enrollment.id,
        courseId,
      };
    });

    // Auto-issue the certificate the moment the course is completed (PRD §6.6).
    // Idempotent; the PNG render + Bunny upload run AFTER the response flushes
    // so course-completion UX never waits on image generation.
    if (result.courseCompleted) {
      try {
        const cert = await ensureCertificateIssued({
          userId,
          courseId: result.courseId,
          enrollmentId: result.enrollmentId,
        });
        after(() => generateAndStoreCertificateImage(cert.id));
      } catch (err) {
        console.error("[complete] certificate auto-issue failed", err);
      }
    }

    return NextResponse.json({
      data: {
        progressPct: result.progressPct,
        completedStepIds: result.completedStepIds,
        totalExpAwarded: result.totalExpAwarded,
        courseCompleted: result.courseCompleted,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/learn/[stepId]/complete]", err);
    return NextResponse.json(
      { error: "Gagal menandai materi selesai." },
      { status: 500 },
    );
  }
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
