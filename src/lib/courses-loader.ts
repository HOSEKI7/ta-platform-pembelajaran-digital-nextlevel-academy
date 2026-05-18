import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

import type { CoursesPageParams, CoursesPageResult, Sort } from "./courses-query";
import { PAGE_SIZE } from "./courses-query";

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

export async function loadCoursesPage(
  params: CoursesPageParams,
): Promise<CoursesPageResult> {
  const { page, category, sort } = params;

  const where: Prisma.CourseWhereInput = {
    status: "PUBLISHED",
    ...(category ? { category: { name: category } } : {}),
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: c.thumbnailUrl,
      price: c.price,
      fakePrice: c.fakePrice,
      estimatedDuration: c.estimatedDuration,
      instructor: c.instructor,
      category: { name: c.category.name },
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
