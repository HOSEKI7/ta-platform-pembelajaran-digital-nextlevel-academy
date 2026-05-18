import { NextResponse } from "next/server";
import { z } from "zod";

import { loadCoursesPage } from "@/lib/courses-loader";
import { SORTS } from "@/lib/courses-query";

// Query params (page/category/sort) vary per request — opt out of static prerender.
export const dynamic = "force-dynamic";
export const revalidate = 60;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(999).default(1),
  category: z.string().min(1).optional(),
  sort: z.enum(SORTS).default("latest"),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { page, category, sort } = parsed.data;
    const data = await loadCoursesPage({
      page,
      category: category ?? null,
      sort,
    });

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/public/courses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
