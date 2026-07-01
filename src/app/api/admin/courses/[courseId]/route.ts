import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isExternalUrl, removeBunnyFile } from "@/lib/bunny-storage";
import {
  isUniqueError,
  parseCourseEditForm,
  uploadCourseImageField,
} from "@/lib/admin-course-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/courses/[courseId] — update General Information + Pengaturan
 * Kursus (Kategori/Instruktur) of an existing course (PRD §6.11.3). Status is
 * NOT changed here — that goes through the dedicated /status route so the Publish
 * validation runs. Multipart: same shape as create. New thumbnail / instructor
 * image replaces the old (old blob deleted best-effort). Benefits/FAQs are
 * replaced wholesale (delete + recreate, preserving order).
 *
 * Slug changes are tracked in CourseSlugHistory (max 20 per course; oldest
 * pruned atomically in the same transaction). Old slugs 308-redirect to the
 * current slug from public catalog & player pages.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { courseId } = await ctx.params;
  const existing = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, slug: true, thumbnailUrl: true, instructorImg: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa multipart/form-data." },
      { status: 400 },
    );
  }

  const parsed = parseCourseEditForm(form);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const input = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
  }

  const slug = input.slug;
  const slugChanged = slug !== existing.slug;
  if (slugChanged) {
    // Check uniqueness against Course (excluding self).
    const taken = await prisma.course.findFirst({
      where: { slug, NOT: { id: courseId } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Slug sudah dipakai kursus lain. Ubah slug." },
        { status: 409 },
      );
    }
    // Check uniqueness against other courses' slug history.
    const historyTaken = await prisma.courseSlugHistory.findFirst({
      where: { slug, courseId: { not: courseId } },
      select: { id: true },
    });
    if (historyTaken) {
      return NextResponse.json(
        { error: "Slug sudah dipakai kursus lain. Ubah slug." },
        { status: 409 },
      );
    }
  }

  // Optional image replacements.
  const thumb = await uploadCourseImageField({
    form,
    field: "thumbnail",
    kind: "thumbnail",
    adminId: auth.user.id,
  });
  if (!thumb.ok) return NextResponse.json({ error: thumb.error }, { status: thumb.status });

  const instructorImg = await uploadCourseImageField({
    form,
    field: "instructorImg",
    kind: "instructor",
    adminId: auth.user.id,
  });
  if (!instructorImg.ok) {
    if (thumb.path) await removeBunnyFile(thumb.path);
    return NextResponse.json({ error: instructorImg.error }, { status: instructorImg.status });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // ---- Slug history (only when slug actually changes) ----
      if (slugChanged) {
        // 1. Record the OLD slug as history so old URLs 308-redirect.
        await tx.courseSlugHistory.create({
          data: {
            courseId,
            slug: existing.slug,
            changedById: auth.user.id,
          },
        });
        // 2. If the NEW slug was previously used by this same course, reclaim it
        //    (delete the history entry so the unique constraint doesn't block us).
        await tx.courseSlugHistory.deleteMany({
          where: { courseId, slug },
        });
        // 3. Prune oldest entries — keep newest 19 (we already inserted 1 = 20).
        const count = await tx.courseSlugHistory.count({ where: { courseId } });
        if (count > 20) {
          const old = await tx.courseSlugHistory.findMany({
            where: { courseId },
            orderBy: { changedAt: "asc" },
            take: count - 20,
            select: { id: true },
          });
          await tx.courseSlugHistory.deleteMany({
            where: { id: { in: old.map((h) => h.id) } },
          });
        }
      }

      // ---- Benefits / FAQs / course update ----
      await tx.courseBenefit.deleteMany({ where: { courseId } });
      await tx.courseFaq.deleteMany({ where: { courseId } });
      await tx.course.update({
        where: { id: courseId },
        data: {
          title: input.title,
          slug,
          description: input.description,
          shortDescription: input.shortDescription || null,
          categoryId: input.categoryId,
          price: input.price,
          fakePrice: input.fakePrice ?? null,
          instructor: input.instructor,
          instructorBio: input.instructorBio,
          isFeatured: input.isFeatured,
          ...(thumb.path ? { thumbnailUrl: thumb.path } : {}),
          ...(instructorImg.path ? { instructorImg: instructorImg.path } : {}),
          benefits: {
            create: input.benefits.map((b, i) => ({ text: b.text, order: i })),
          },
          faqs: {
            create: input.faqs.map((f, i) => ({
              question: f.question,
              answer: f.answer,
              order: i,
            })),
          },
        },
      });
    });
  } catch (err) {
    if (thumb.path) await removeBunnyFile(thumb.path);
    if (instructorImg.path) await removeBunnyFile(instructorImg.path);
    if (isUniqueError(err)) {
      return NextResponse.json(
        { error: "Slug sudah dipakai kursus lain. Ubah slug." },
        { status: 409 },
      );
    }
    console.error("[admin/courses PATCH] update failed", err);
    return NextResponse.json({ error: "Gagal memperbarui kursus. Coba lagi." }, { status: 500 });
  }

  // Replaced images → delete old blobs (best-effort; skip external/seed URLs).
  if (thumb.path && existing.thumbnailUrl && !isExternalUrl(existing.thumbnailUrl)) {
    removeBunnyFile(existing.thumbnailUrl).catch(() => {});
  }
  if (instructorImg.path && existing.instructorImg && !isExternalUrl(existing.instructorImg)) {
    removeBunnyFile(existing.instructorImg).catch(() => {});
  }

  return NextResponse.json({ data: { id: courseId } });
}

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
