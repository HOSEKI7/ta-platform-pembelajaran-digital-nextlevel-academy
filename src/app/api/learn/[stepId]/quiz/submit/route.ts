import { NextResponse, type NextRequest } from "next/server";

import { ExpSource, Prisma, Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { submitQuizSchema } from "@/lib/validators/quiz";

export const dynamic = "force-dynamic";

/** PRD §6.5.7 / §6.7.x — quiz rules. */
const EXP_QUIZ_PASS = 90;
const EXP_COURSE_COMPLETE = 600;
const MAX_ATTEMPTS_PER_WINDOW = 3;
const COOLDOWN_MS = 30 * 60 * 1000;

/**
 * POST /api/learn/[stepId]/quiz/submit
 *
 * Submits a multiple-choice quiz attempt for the authenticated student.
 *
 * Business rules (PRD §6.5.7):
 *   - Passing score is `Quiz.passingScore` (default 80/100, configurable).
 *   - Max 3 attempts per window. After the 3rd failed attempt the student
 *     enters a 30-minute cooldown. On the next submit after cooldown
 *     expiry the window resets (attempts back to 0 before counting this one).
 *   - +90 EXP is awarded ONLY on the first successful pass — repeated passes
 *     are idempotent via the `ExpLog @@unique([userId, source, refId])`
 *     constraint.
 *   - Once a student has passed, retakes are allowed for review but never
 *     unset `StepProgress.isCompleted`.
 *
 * The whole flow runs inside `prisma.$transaction` so attempts/score/cooldown
 * /EXP/progress stay consistent under concurrent submissions.
 *
 * Response:
 * ```
 * { data: {
 *     score, passed, attempts, cooldownUntil,
 *     expAwarded, progressPct, completedStepIds, courseCompleted
 * } }
 * ```
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
    return NextResponse.json({ error: "Body harus JSON valid." }, { status: 400 });
  }

  const parsed = submitQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Body tidak valid." },
      { status: 400 },
    );
  }
  const { answers } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Load step + quiz + (server-only) question answers
      const step = await tx.step.findUnique({
        where: { id: stepId },
        select: {
          id: true,
          type: true,
          sprint: { select: { courseId: true } },
          quiz: {
            select: {
              id: true,
              passingScore: true,
              questions: {
                select: { id: true, options: true, answer: true },
              },
            },
          },
        },
      });
      if (!step) throw new HttpError(404, "Materi tidak ditemukan.");
      if (step.type !== "QUIZ" || !step.quiz) {
        throw new HttpError(400, "Step ini bukan kuis.");
      }
      if (step.quiz.questions.length === 0) {
        throw new HttpError(400, "Kuis belum punya soal.");
      }

      const courseId = step.sprint.courseId;

      // 2. Verify enrollment
      const enrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true, completedAt: true },
      });
      if (!enrollment) {
        throw new HttpError(403, "Kamu belum terdaftar di kursus ini.");
      }

      // 3. Load existing progress (may not exist yet)
      const existing = await tx.stepProgress.findUnique({
        where: { enrollmentId_stepId: { enrollmentId: enrollment.id, stepId } },
        select: {
          isCompleted: true,
          quizAttempts: true,
          cooldownUntil: true,
        },
      });

      const now = new Date();

      // 4. Cooldown gate. If cooldown is in the future -> 429. If it expired
      //    -> reset attempts to 0 before counting this submission.
      let attemptsBase = existing?.quizAttempts ?? 0;
      if (existing?.cooldownUntil) {
        if (existing.cooldownUntil > now) {
          throw new HttpError(
            429,
            "Cooldown masih aktif. Coba lagi setelah waktu cooldown habis.",
            { cooldownUntil: existing.cooldownUntil.toISOString() },
          );
        }
        // Cooldown expired -> next attempt window starts fresh.
        attemptsBase = 0;
      }

      // 5. Score the submission. Build a quick lookup of user answers by
      //    questionId. Unknown questions (not part of this quiz) are ignored.
      const answerMap = new Map<string, number>();
      for (const a of answers) answerMap.set(a.questionId, a.optionIndex);

      let correctCount = 0;
      for (const q of step.quiz.questions) {
        const userIdx = answerMap.get(q.id);
        if (typeof userIdx !== "number") continue;
        const optionsLen = Array.isArray(q.options) ? q.options.length : 0;
        if (userIdx < 0 || userIdx >= optionsLen) continue; // out-of-range counts as wrong
        if (userIdx === q.answer) correctCount += 1;
      }
      const total = step.quiz.questions.length;
      const score = Math.round((correctCount / total) * 100);
      const passed = score >= step.quiz.passingScore;

      // 6. Compute new attempts / cooldown / completion
      const newAttempts = attemptsBase + 1;
      const triggerCooldown =
        !passed && newAttempts >= MAX_ATTEMPTS_PER_WINDOW;
      const newCooldownUntil = passed
        ? null
        : triggerCooldown
          ? new Date(now.getTime() + COOLDOWN_MS)
          : null;
      // Never unset isCompleted once passed — retakes after passing don't
      // demote the step.
      const newIsCompleted = passed || Boolean(existing?.isCompleted);
      const newCompletedAtPatch =
        passed && !existing?.isCompleted ? { completedAt: now } : {};

      // 7. Upsert progress
      await tx.stepProgress.upsert({
        where: { enrollmentId_stepId: { enrollmentId: enrollment.id, stepId } },
        create: {
          enrollmentId: enrollment.id,
          stepId,
          isCompleted: newIsCompleted,
          completedAt: passed ? now : null,
          quizScore: score,
          quizAttempts: newAttempts,
          cooldownUntil: newCooldownUntil,
        },
        update: {
          isCompleted: newIsCompleted,
          quizScore: score,
          quizAttempts: newAttempts,
          cooldownUntil: newCooldownUntil,
          ...newCompletedAtPatch,
        },
      });

      // 8. Award +90 EXP on first pass (idempotent via ExpLog unique)
      let awardedQuizExp = 0;
      if (passed) {
        try {
          await tx.expLog.create({
            data: {
              userId,
              amount: EXP_QUIZ_PASS,
              source: ExpSource.QUIZ_PASS,
              refId: stepId,
            },
          });
          awardedQuizExp = EXP_QUIZ_PASS;
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            // Already awarded — retake after pass, no double-award.
          } else {
            throw err;
          }
        }
        if (awardedQuizExp > 0) {
          await tx.userGameProfile.upsert({
            where: { userId },
            create: {
              userId,
              exp: awardedQuizExp,
              totalExp: awardedQuizExp,
            },
            update: {
              exp: { increment: awardedQuizExp },
              totalExp: { increment: awardedQuizExp },
            },
          });
        }
      }

      // 9. Recompute course progress
      const [totalSteps, completedRows] = await Promise.all([
        tx.step.count({ where: { sprint: { courseId } } }),
        tx.stepProgress.findMany({
          where: { enrollmentId: enrollment.id, isCompleted: true },
          select: { stepId: true },
        }),
      ]);
      const completedSteps = completedRows.length;
      const progressPct =
        totalSteps === 0
          ? 0
          : Math.round((completedSteps / totalSteps) * 1000) / 10;

      // 10. Course completion bonus (idempotent)
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
            courseCompleted = false;
          } else {
            throw err;
          }
        }
      }

      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPct,
          lastAccessedAt: now,
          ...(courseCompleted ? { completedAt: now } : {}),
        },
      });

      return {
        score,
        passed,
        attempts: newAttempts,
        cooldownUntil: newCooldownUntil ? newCooldownUntil.toISOString() : null,
        expAwarded: awardedQuizExp + awardedCourseExp,
        progressPct,
        completedStepIds: completedRows.map((r) => r.stepId),
        courseCompleted,
        correctCount,
        totalQuestions: total,
      };
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { error: err.message, ...(err.payload ?? {}) },
        { status: err.status },
      );
    }
    console.error("[POST /api/learn/[stepId]/quiz/submit]", err);
    return NextResponse.json(
      { error: "Gagal mengirim jawaban kuis." },
      { status: 500 },
    );
  }
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: Record<string, unknown>,
  ) {
    super(message);
  }
}
