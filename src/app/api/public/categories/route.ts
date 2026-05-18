import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export type CategoriesApiResponse = {
  data: {
    categories: { name: string; courseCount: number }[];
    totalPublished: number;
  };
};

export async function GET() {
  try {
    const [categories, totalPublished] = await Promise.all([
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
    ]);

    return NextResponse.json(
      {
        data: {
          categories: categories
            .filter((c) => c._count.courses > 0)
            .map((c) => ({ name: c.name, courseCount: c._count.courses })),
          totalPublished,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/public/categories]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
