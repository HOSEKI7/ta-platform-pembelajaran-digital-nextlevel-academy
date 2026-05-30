import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isExternalUrl, removeBunnyFile } from "@/lib/bunny-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/courses/[courseId] — permanently delete a course (cascades
 * sprints/steps/benefits/faqs).
 *
 * Guard: a course that already has enrollments OR orders is NOT deletable —
 * doing so would orphan paid learners and break FK integrity, and contradicts
 * PRD §6.11.3.2 which says purchased content should be Archived (data kept),
 * not destroyed. Such requests get a 409 steering the admin toward Archive.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { courseId } = await ctx.params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      thumbnailUrl: true,
      _count: { select: { enrollments: true, orders: true } },
    },
  });
  if (!course) {
    return NextResponse.json(
      { error: "Kursus tidak ditemukan." },
      { status: 404 },
    );
  }

  if (course._count.enrollments > 0 || course._count.orders > 0) {
    return NextResponse.json(
      {
        error:
          "Kursus sudah memiliki peserta atau transaksi — arsipkan saja, jangan hapus.",
      },
      { status: 409 },
    );
  }

  try {
    await prisma.course.delete({ where: { id: course.id } });
  } catch (err) {
    console.error("[admin/courses DELETE] db delete failed", err);
    return NextResponse.json(
      { error: "Gagal menghapus kursus. Coba lagi." },
      { status: 500 },
    );
  }

  // Best-effort cleanup of the thumbnail blob (Bunny object-paths only; skip
  // external/Supabase URLs). Never blocks the success response.
  if (course.thumbnailUrl && !isExternalUrl(course.thumbnailUrl)) {
    removeBunnyFile(course.thumbnailUrl).catch(() => {});
  }

  return NextResponse.json({ data: { ok: true } });
}
