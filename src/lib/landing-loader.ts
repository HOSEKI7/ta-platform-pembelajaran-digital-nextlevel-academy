import "server-only";

import { cache } from "react";

import { Role } from "@/generated/prisma";
import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";

import type { CourseCardData } from "@/components/public/landing/course-card";

// ponytail: fallback during build (CI has no real DB) — ISR replaces on first request
async function heroStats() {
  const [courseCount, learnerCount] = await Promise.all([
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: Role.PESERTA_DIDIK } }),
  ]);
  return { courseCount, learnerCount };
}
export const loadHeroStats = cache(async () => {
  try {
    return await heroStats();
  } catch {
    return { courseCount: 0, learnerCount: 0 };
  }
});

async function featuredCourses() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: { category: { select: { name: true } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  return courses.map(
    (c) =>
      ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: resolveCourseImageUrl(c.thumbnailUrl),
        price: c.price,
        fakePrice: c.fakePrice,
        estimatedDuration: c.estimatedDuration,
        instructor: c.instructor,
        category: { name: c.category.name },
      }) as CourseCardData,
  );
}
export const loadFeaturedCourses = cache(async () => {
  try {
    return await featuredCourses();
  } catch {
    return [];
  }
});

async function landingStats() {
  const [learners, courses, enrollments, completedEnrollments] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.PESERTA_DIDIK } }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { progressPct: { gte: 100 } } }),
    ]);

  const completionRate =
    enrollments > 0
      ? Math.round((completedEnrollments / enrollments) * 100)
      : 0;

  return { learners, courses, enrollments, completionRate };
}
export const loadLandingStats = cache(async () => {
  try {
    return await landingStats();
  } catch {
    return { learners: 0, courses: 0, enrollments: 0, completionRate: 0 };
  }
});
