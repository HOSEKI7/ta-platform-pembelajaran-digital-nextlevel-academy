import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

import {
  PAGE_SIZE,
  type Sort,
  type StudentCatalogParams,
  type StudentCatalogResult,
} from "./student-catalog-query";

function orderByFor(sort: Sort): Prisma.CourseOrderByWithRelationInput[] {
  switch (sort) {
    case "popular":
      return [{ enrollments: { _count: "desc" } }, { createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "latest":
    default:
      return [{ createdAt: "desc" }];
  }
}

/**
 * Loads one page of the student-area catalog.
 *
 * Performance shape:
 * - 2 parallel queries for the page slice (count + findMany), matching the
 *   public catalog loader.
 * - 1 follow-up query against the Enrollment table scoped to the IDs we are
 *   about to return — never to the full catalog — so ownership lookup is O(9)
 *   regardless of how many courses the user owns.
 */
export async function loadStudentCatalogPage(
  userId: string,
  params: StudentCatalogParams,
): Promise<StudentCatalogResult> {
  const { page, category, sort, search } = params;

  const where: Prisma.CourseWhereInput = {
    status: "PUBLISHED",
    ...(category ? { category: { name: category } } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: orderByFor(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const ownedIds = courses.length
    ? new Set(
        (
          await prisma.enrollment.findMany({
            where: { userId, courseId: { in: courses.map((c) => c.id) } },
            select: { courseId: true },
          })
        ).map((e) => e.courseId),
      )
    : new Set<string>();

  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: c.thumbnailUrl,
      shortDescription: c.shortDescription,
      price: c.price,
      fakePrice: c.fakePrice,
      estimatedDuration: c.estimatedDuration,
      instructor: c.instructor,
      category: { name: c.category.name },
      isOwned: ownedIds.has(c.id),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
