import "server-only";

import { signBunnyEmbedUrl } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";

import type {
  CoursePlayerData,
  PlayerCourse,
  PlayerSprint,
  PlayerStep,
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
 * Loads everything the Course Player needs in a single round-trip:
 * enrollment + course + sprints + steps + videos + completed progress rows.
 * Returns `null` when the user has no enrollment for this slug — the page
 * then triggers `notFound()` (and surfaces our custom cinematic 404).
 *
 * The function intentionally fetches the course THROUGH the enrollment so
 * that a non-enrolled user never sees a "course exists but you can't enter"
 * signal: from their perspective, the URL simply doesn't resolve.
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
                include: { video: true },
              },
            },
          },
        },
      },
      progresses: {
        where: { isCompleted: true },
        select: { stepId: true },
      },
    },
  });

  if (!enrollment) return null;

  const c = enrollment.course;

  const sprints: PlayerSprint[] = c.sprints.map((sp) => ({
    id: sp.id,
    title: sp.title,
    order: sp.order,
    steps: sp.steps.map<PlayerStep>((st) => ({
      id: st.id,
      title: st.title,
      type: st.type,
      durationSec: st.video?.duration ?? 0,
      description: st.description,
      resources: [],
    })),
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
  for (const sp of c.sprints) {
    for (const st of sp.steps) {
      if (st.type === "VIDEO" && st.video?.bunnyVideoId) {
        try {
          embedUrls[st.id] = signBunnyEmbedUrl(st.video.bunnyVideoId);
        } catch (err) {
          // If Bunny isn't configured yet, skip the URL — the VideoStage
          // component falls back to the placeholder visual.
          console.warn(`[course-player loader] Failed to sign URL for step ${st.id}:`, err);
        }
      }
    }
  }

  return {
    course,
    completedStepIds: enrollment.progresses.map((p) => p.stepId),
    embedUrls,
    courseId: c.id,
    enrollmentId: enrollment.id,
  };
}
