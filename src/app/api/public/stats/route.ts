import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const [learners, courses, enrollments, completedEnrollments] = await Promise.all([
      prisma.user.count({ where: { role: Role.PESERTA_DIDIK } }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { progressPct: { gte: 100 } } }),
    ]);

    const completionRate = enrollments > 0 ? Math.round((completedEnrollments / enrollments) * 100) : 0;

    return NextResponse.json(
      {
        data: {
          learners,
          courses,
          enrollments,
          completionRate,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/public/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
