import "server-only";

import { cache } from "react";

import { Role } from "@/generated/prisma";
import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";

import type { CourseCardData } from "@/components/public/landing/course-card";

export const loadHeroStats = cache(async () => {
  const [courseCount, learnerCount] = await Promise.all([
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: Role.PESERTA_DIDIK } }),
  ]);
  return { courseCount, learnerCount };
});

export const loadFeaturedCourses = cache(async () => {
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
});

export const loadLandingStats = cache(async () => {
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
});
