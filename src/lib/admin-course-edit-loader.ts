import "server-only";

import { prisma } from "@/lib/prisma";
import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import type {
  AdminCategoryOption,
  CourseEditData,
  QuizQuestionDTO,
  SprintDTO,
  StepDTO,
  VideoStatusValue,
} from "@/lib/admin-course-form-types";

/**
 * Loads a single course with its full curriculum for the admin edit page.
 *
 * Performance: one nested `findUnique` (benefits + faqs + sprints → steps →
 * video/quiz → questions) — no per-row follow-up queries (anti-N+1). Images are
 * resolved to signed/passthrough URLs for rendering.
 */
export async function loadCourseForEdit(courseId: string): Promise<CourseEditData | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: { select: { name: true } },
      benefits: { orderBy: { order: "asc" }, select: { text: true } },
      faqs: { orderBy: { order: "asc" }, select: { question: true, answer: true } },
      sprints: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            orderBy: { order: "asc" },
            include: {
              video: {
                select: { bunnyVideoId: true, duration: true, status: true, videoUrl: true },
              },
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
  });

  if (!course) return null;

  const sprints: SprintDTO[] = course.sprints.map((s) => ({
    id: s.id,
    title: s.title,
    order: s.order,
    steps: s.steps.map((step): StepDTO => {
      if (step.type === "QUIZ") {
        return {
          id: step.id,
          type: "QUIZ",
          title: step.title,
          description: step.description,
          order: step.order,
          passingScore: step.quiz?.passingScore ?? 80,
          questions: (step.quiz?.questions ?? []).map(
            (q): QuizQuestionDTO => ({
              id: q.id,
              question: q.question ?? "",
              questionImageUrl: resolveCourseImageUrl(q.questionImageUrl),
              questionImageRaw: q.questionImageUrl ?? null,
              options: Array.isArray(q.options) ? (q.options as string[]) : [],
              answer: q.answer,
            }),
          ),
        };
      }
      return {
        id: step.id,
        type: "VIDEO",
        title: step.title,
        description: step.description,
        order: step.order,
        video: step.video
          ? {
              bunnyVideoId: step.video.bunnyVideoId,
              duration: step.video.duration,
              status: step.video.status as VideoStatusValue,
              videoUrl: step.video.videoUrl,
            }
          : null,
      };
    }),
  }));

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription ?? "",
    description: course.description,
    categoryId: course.categoryId,
    categoryName: course.category.name,
    thumbnailUrl: resolveCourseImageUrl(course.thumbnailUrl),
    instructorImgUrl: resolveCourseImageUrl(course.instructorImg),
    price: course.price,
    fakePrice: course.fakePrice,
    instructor: course.instructor,
    instructorBio: course.instructorBio,
    isFeatured: course.isFeatured,
    status: course.status,
    publishedAt: course.publishedAt ? course.publishedAt.toISOString() : null,
    benefits: course.benefits.map((b) => ({ text: b.text })),
    faqs: course.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    sprints,
  };
}

/** All categories for the form's Kategori select. */
export async function loadAllCategories(): Promise<AdminCategoryOption[]> {
  const cats = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return cats.map((c) => ({ id: c.id, name: c.name }));
}
