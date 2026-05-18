import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const [courseCount, learnerCount] = await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: Role.PESERTA_DIDIK } }),
    ]);

    return NextResponse.json(
      { data: { courseCount, learnerCount } },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/public/hero-stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
