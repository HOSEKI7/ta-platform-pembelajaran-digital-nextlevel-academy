import { NextResponse } from "next/server";

import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const TAKE = 6;

export async function GET() {
  try {
    // isFeatured: true rows surface first; the rest fills with newest published
    // so the section is always populated even before admins curate picks.
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { category: { select: { name: true } } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: TAKE,
    });

    return NextResponse.json(
      {
        data: {
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            thumbnailUrl: resolveCourseImageUrl(c.thumbnailUrl),
            price: c.price,
            fakePrice: c.fakePrice,
            estimatedDuration: c.estimatedDuration,
            instructor: c.instructor,
            category: { name: c.category.name },
          })),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/public/featured-courses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
