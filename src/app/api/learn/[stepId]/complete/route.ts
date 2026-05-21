import { NextResponse, type NextRequest } from "next/server";

import { ExpSource, Prisma, Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** PRD §6.5.6 / §6.7.x — fixed EXP awards per source. */
const EXP_VIDEO_COMPLETE = 15;
const EXP_QUIZ_PASS = 90;
const EXP_COURSE_COMPLETE = 600;

/**
 * POST /api/learn/[stepId]/complete
 *
 * Marks a step as completed for the authenticated student's enrollment.
 * Triggered by EITHER:
 *   1. Manual click on the "Tandai Selesai" button in the player, or
 *   2. The video player firing `ended` / `timeupdate >= duration-1`.
 *
 * The endpoint is idempotent: repeated calls do NOT award EXP twice. The
 * `ExpLog` table's `@@unique([userId, source, refId])` constraint enforces
 * this at the DB level — we catch the unique-violation and treat it as
 * "already awarded".
 *
 * Side effects (atomic transaction):
 *   1. Upsert `StepProgress` -> isCompleted: true
 *   2. Award step-level EXP (+15 VIDEO / +90 QUIZ_PASS) — first time only
 *   3. Increment `UserGameProfile.exp` + `totalExp`
 *   4. Recompute `Enrollment.progressPct`
 *   5. If 100% and not previously completed: set `Enrollment.completedAt`,
 *      award +600 COURSE_COMPLETE EXP
 *   6. Bump `Enrollment.lastAccessedAt`
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

      // 2. Award step EXP — idempotent via ExpLog unique([userId, source, refId])
      const stepSource =
        step.type === "QUIZ" ? ExpSource.QUIZ_PASS : ExpSource.VIDEO_COMPLETE;
      const stepExp = step.type === "QUIZ" ? EXP_QUIZ_PASS : EXP_VIDEO_COMPLETE;

      let awardedStepExp = 0;
      try {
        await tx.expLog.create({
          data: {
            userId,
            amount: stepExp,
            source: stepSource,
            refId: stepId,
          },
        });
        awardedStepExp = stepExp;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          // Already awarded for this user+source+step — that's fine.
        } else {
          throw err;
        }
      }

      // 3. Increment UserGameProfile if EXP was actually awarded
      if (awardedStepExp > 0) {
        await tx.userGameProfile.upsert({
          where: { userId },
          create: {
            userId,
            exp: awardedStepExp,
            totalExp: awardedStepExp,
          },
          update: {
            exp: { increment: awardedStepExp },
            totalExp: { increment: awardedStepExp },
          },
        });
      }

      // 4. Recompute progress
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

      // 5. Course completion bonus
      const isCourseComplete = totalSteps > 0 && completedSteps === totalSteps;
      let courseCompleted = false;
      let awardedCourseExp = 0;

      if (isCourseComplete && !enrollment.completedAt) {
        courseCompleted = true;
        try {
          await tx.expLog.create({
            data: {
              userId,
              amount: EXP_COURSE_COMPLETE,
              source: ExpSource.COURSE_COMPLETE,
              refId: courseId,
            },
          });
          awardedCourseExp = EXP_COURSE_COMPLETE;
          await tx.userGameProfile.update({
            where: { userId },
            data: {
              exp: { increment: EXP_COURSE_COMPLETE },
              totalExp: { increment: EXP_COURSE_COMPLETE },
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            // Already awarded course bonus earlier
            courseCompleted = false;
          } else {
            throw err;
          }
        }
      }

      // 6. Update enrollment (progress + access timestamp + maybe completedAt)
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPct,
          lastAccessedAt: now,
          ...(courseCompleted ? { completedAt: now } : {}),
        },
      });

      return {
        progressPct,
        completedStepIds: completedRows.map((r) => r.stepId),
        totalExpAwarded: awardedStepExp + awardedCourseExp,
        courseCompleted,
      };
    });

    return NextResponse.json({ data: result });
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
