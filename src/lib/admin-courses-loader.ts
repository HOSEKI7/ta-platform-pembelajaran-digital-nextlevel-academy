import "server-only";

import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

import {
  PAGE_SIZE,
  type AdminCourseCategory,
  type AdminCoursesParams,
  type AdminCoursesResult,
} from "./admin-courses-query";

/**
 * Loads one page of the admin Course Management table.
 *
 * Performance shape:
 * - 2 parallel queries (count + findMany) for the page slice.
 * - Enrollment totals come from a `_count` aggregate on the same findMany —
 *   no per-row follow-up query (anti-N+1).
 *
 * Unlike the student catalog this loader is status-agnostic by default: admins
 * see Draft / Published / Archived alike, filtered only when `status` is set.
 */
export async function loadAdminCoursesPage(
  params: AdminCoursesParams,
): Promise<AdminCoursesResult> {
  const { page, category, status, search } = params;

  const where: Prisma.CourseWhereInput = {
    ...(status !== "all" ? { status } : {}),
    ...(category ? { category: { name: category } } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      include: {
        category: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: resolveCourseImageUrl(c.thumbnailUrl),
      category: { name: c.category.name },
      instructor: c.instructor,
      price: c.price,
      enrollmentCount: c._count.enrollments,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * All categories with their total course count (across every status — admins
 * manage Draft/Archived too). Powers the category filter dropdown.
 */
export async function loadAdminCourseCategories(): Promise<
  AdminCourseCategory[]
> {
  const categories = await prisma.category.findMany({
    select: { name: true, _count: { select: { courses: true } } },
    orderBy: { name: "asc" },
  });
  return categories.map((c) => ({ name: c.name, courseCount: c._count.courses }));
}
