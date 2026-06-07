import "server-only";

import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

import {
  PAGE_SIZE,
  type Sort,
  type StudentCatalogCourse,
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

  const skip = (page - 1) * PAGE_SIZE;
  const include = {
    category: { select: { name: true } },
  } satisfies Prisma.CourseInclude;

  type CourseRow = Prisma.CourseGetPayload<{ include: typeof include }>;

  const total = await prisma.course.count({ where });

  let courses: CourseRow[];
  let ownedIds: Set<string>;

  if (sort === "latest") {
    // Default ordering pins courses the student already owns to the top
    // (newest first), then the rest of the catalog (newest first). We page
    // across the two contiguous blocks with exact skip/take math so owned and
    // unowned items never duplicate or skip at the page boundary.
    const owned = await prisma.enrollment.findMany({
      where: { userId, course: where },
      select: { courseId: true },
    });
    const ownedCourseIds = owned.map((e) => e.courseId);
    ownedIds = new Set(ownedCourseIds);
    const ownedTotal = ownedCourseIds.length;

    const ownedTake = Math.max(0, Math.min(PAGE_SIZE, ownedTotal - skip));
    const ownedRows =
      ownedTake > 0
        ? await prisma.course.findMany({
            where: { ...where, id: { in: ownedCourseIds } },
            include,
            orderBy: { createdAt: "desc" },
            skip,
            take: ownedTake,
          })
        : [];

    const remaining = PAGE_SIZE - ownedRows.length;
    const unownedRows =
      remaining > 0
        ? await prisma.course.findMany({
            where: { ...where, id: { notIn: ownedCourseIds } },
            include,
            orderBy: { createdAt: "desc" },
            skip: Math.max(0, skip - ownedTotal),
            take: remaining,
          })
        : [];

    courses = [...ownedRows, ...unownedRows];
  } else {
    courses = await prisma.course.findMany({
      where,
      include,
      orderBy: orderByFor(sort),
      skip,
      take: PAGE_SIZE,
    });
    ownedIds = courses.length
      ? new Set(
          (
            await prisma.enrollment.findMany({
              where: { userId, courseId: { in: courses.map((c) => c.id) } },
              select: { courseId: true },
            })
          ).map((e) => e.courseId),
        )
      : new Set<string>();
  }

  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: resolveCourseImageUrl(c.thumbnailUrl),
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

/**
 * Loads a single published course in the catalog-card shape, for the catalog
 * deep-link popup (`/catalog?preview=<slug>`). Returns `null` when the slug
 * doesn't match a published course. Ownership is resolved for `userId` so the
 * popup shows the correct CTA ("Lanjut Belajar" vs "Checkout"), exactly like a
 * card clicked from the grid.
 */
export async function loadCatalogCoursePreview(
  userId: string,
  slug: string,
): Promise<StudentCatalogCourse | null> {
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: { select: { name: true } } },
  });
  if (!course) return null;

  const owned = await prisma.enrollment.findFirst({
    where: { userId, courseId: course.id },
    select: { id: true },
  });

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    thumbnailUrl: resolveCourseImageUrl(course.thumbnailUrl),
    shortDescription: course.shortDescription,
    price: course.price,
    fakePrice: course.fakePrice,
    estimatedDuration: course.estimatedDuration,
    instructor: course.instructor,
    category: { name: course.category.name },
    isOwned: Boolean(owned),
  };
}
