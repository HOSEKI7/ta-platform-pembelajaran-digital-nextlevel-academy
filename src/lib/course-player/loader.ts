import "server-only";

import { after } from "next/server";

import { signBunnyEmbedUrl } from "@/lib/bunny";
import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";
import { selfHealVideoDurations, type SelfHealCandidate } from "./sync-video-duration";

import type {
  CoursePlayerData,
  PlayerCourse,
  PlayerQuiz,
  PlayerQuizOption,
  PlayerSprint,
  PlayerStep,
  QuizStepState,
} from "./types";

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/**
 * `QuizQuestion.options` is stored as Json — Prisma surfaces it as
 * `Prisma.JsonValue`. We accept arrays of primitive strings; everything else
 * is filtered out / coerced so a malformed row never crashes the loader.
 */
function coerceOptions(raw: unknown): PlayerQuizOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string");
}

/**
 * Loads everything the Course Player needs in a single round-trip:
 * enrollment + course + sprints + steps + videos + quizzes + completed
 * progress rows + quiz-step progress state.
 *
 * Returns `null` when the user has no enrollment for this slug — the page
 * then triggers `notFound()` (and surfaces our custom cinematic 404).
 *
 * Security: `QuizQuestion.answer` (the correct option index) is NEVER mapped
 * into the returned shape. Only server-side code (the /quiz/submit route)
 * touches that field.
 */
export async function loadCoursePlayer(
  userId: string,
  slug: string,
): Promise<CoursePlayerData | null> {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, course: { slug } },
    include: {
      course: {
        include: {
          category: { select: { name: true } },
          sprints: {
            orderBy: { order: "asc" },
            include: {
              steps: {
                orderBy: { order: "asc" },
                include: {
                  video: true,
                  quiz: {
                    include: {
                      questions: { orderBy: { order: "asc" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      progresses: {
        select: {
          stepId: true,
          isCompleted: true,
          quizScore: true,
          quizAttempts: true,
          cooldownUntil: true,
        },
      },
      stepNotes: {
        select: { stepId: true, content: true },
      },
    },
  });

  if (!enrollment) return null;

  const c = enrollment.course;
  const progressById = new Map(enrollment.progresses.map((p) => [p.stepId, p]));

  const sprints: PlayerSprint[] = c.sprints.map((sp) => ({
    id: sp.id,
    title: sp.title,
    order: sp.order,
    steps: sp.steps.map<PlayerStep>((st) => {
      let quiz: PlayerQuiz | undefined;
      if (st.type === "QUIZ" && st.quiz) {
        quiz = {
          passingScore: st.quiz.passingScore,
          questions: st.quiz.questions.map((q) => ({
            id: q.id,
            question: q.question,
            // Stored as a Bunny object-path (or legacy external URL) — must be
            // resolved/signed for rendering, exactly like the admin loader.
            questionImageUrl: q.questionImageUrl
              ? resolveCourseImageUrl(q.questionImageUrl) || null
              : null,
            options: coerceOptions(q.options),
            order: q.order,
            // NOTE: `q.answer` deliberately omitted — server-only.
          })),
        };
      }
      return {
        id: st.id,
        title: st.title,
        type: st.type,
        durationSec: st.video?.duration ?? 0,
        description: st.description,
        quiz,
      };
    }),
  }));

  const course: PlayerCourse = {
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category.name,
    instructor: {
      name: c.instructor,
      role: "Instruktur",
      bio: c.instructorBio,
      avatarInitials: initialsFrom(c.instructor),
    },
    sprints,
  };

  const embedUrls: Record<string, string> = {};
  const quizStates: Record<string, QuizStepState> = {};
  const healCandidates: SelfHealCandidate[] = [];
  const nowMs = Date.now();

  for (const sp of c.sprints) {
    for (const st of sp.steps) {
      if (st.type === "VIDEO" && st.video?.bunnyVideoId) {
        // Lazily reconcile durations that the Bunny webhook never delivered.
        if (st.video.duration === 0) {
          healCandidates.push({
            id: st.video.id,
            bunnyVideoId: st.video.bunnyVideoId,
            duration: st.video.duration,
            lastSyncedAt: st.video.lastSyncedAt,
          });
        }
        try {
          embedUrls[st.id] = signBunnyEmbedUrl(st.video.bunnyVideoId);
        } catch (err) {
          // If Bunny isn't configured yet, skip the URL — the VideoStage
          // component falls back to the placeholder visual.
          console.warn(`[course-player loader] Failed to sign URL for step ${st.id}:`, err);
        }
      }
      if (st.type === "QUIZ") {
        const p = progressById.get(st.id);
        // Only surface `cooldownUntil` while it's still in the future. The
        // DB keeps the raw timestamp until the next submission clears or
        // resets it; filtering here lets the client treat "non-null
        // cooldownUntil" as "cooldown is active right now" without ever
        // computing the clock during render.
        const cd =
          p?.cooldownUntil && p.cooldownUntil.getTime() > nowMs
            ? p.cooldownUntil.toISOString()
            : null;
        quizStates[st.id] = {
          stepId: st.id,
          attempts: p?.quizAttempts ?? 0,
          cooldownUntil: cd,
          lastScore: p?.quizScore ?? null,
          isPassed: Boolean(p?.isCompleted),
        };
      }
    }
  }

  const completedStepIds = enrollment.progresses
    .filter((p) => p.isCompleted)
    .map((p) => p.stepId);

  const notes: Record<string, string> = {};
  for (const n of enrollment.stepNotes) {
    notes[n.stepId] = n.content;
  }

  // Non-blocking: reconcile any duration-0 videos from Bunny after the response
  // is sent, so the NEXT load reflects real lengths without slowing this one.
  if (healCandidates.length > 0) {
    after(() => selfHealVideoDurations(healCandidates));
  }

  return {
    course,
    completedStepIds,
    notes,
    embedUrls,
    quizStates,
    courseId: c.id,
    enrollmentId: enrollment.id,
  };
}
