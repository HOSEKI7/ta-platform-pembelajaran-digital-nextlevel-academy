import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminCoursesPage } from "@/lib/admin-courses-loader";
import {
  parsePage,
  parseSearch,
  parseStatus,
} from "@/lib/admin-courses-query";
import { prisma } from "@/lib/prisma";
import { removeBunnyFile } from "@/lib/bunny-storage";
import { slugify } from "@/lib/slugify";
import {
  isUniqueError,
  parseCourseGeneralForm,
  uploadCourseImageField,
} from "@/lib/admin-course-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/courses — paginated, filterable course list for the admin
 * Course Management table. Mirrors the student catalog endpoint but is gated to
 * ADMINISTRATOR and returns every status.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const data = await loadAdminCoursesPage({
      page: parsePage(searchParams.get("page")),
      category: category && category.length > 0 ? category : null,
      status: parseStatus(searchParams.get("status")),
      search: parseSearch(searchParams.get("search")),
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/courses GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar kursus." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/courses — create a course as DRAFT (PRD §6.11.3, two-phase
 * flow). Accepts multipart/form-data: general text fields + benefits/faqs JSON +
 * optional thumbnail / instructor image. Slug uniqueness is enforced (409). On a
 * DB failure after the images upload, the blobs are rolled back. Returns the new
 * course id so the client can redirect to `/admin/courses/[id]/edit`.
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa multipart/form-data." },
      { status: 400 },
    );
  }

  const parsed = parseCourseGeneralForm(form);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const input = parsed.data;

  // Category must exist (FK + clearer error than a raw P2003).
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
  }

  const slug = input.slug || slugify(input.title);
  const slugTaken = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (slugTaken) {
    return NextResponse.json(
      { error: "Slug sudah dipakai kursus lain. Ubah slug." },
      { status: 409 },
    );
  }

  // Upload images (optional for a draft). Roll back the first if the second fails.
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
    const course = await prisma.course.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        shortDescription: input.shortDescription || null,
        categoryId: input.categoryId,
        thumbnailUrl: thumb.path ?? "",
        price: input.price,
        fakePrice: input.fakePrice ?? null,
        instructor: input.instructor,
        instructorBio: input.instructorBio,
        instructorImg: instructorImg.path ?? "",
        isFeatured: input.isFeatured,
        status: "DRAFT", // always DRAFT on create; publish via the status route
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
      select: { id: true },
    });
    return NextResponse.json({ data: { id: course.id } }, { status: 201 });
  } catch (err) {
    // Roll back uploaded blobs so a retry doesn't leak storage.
    if (thumb.path) await removeBunnyFile(thumb.path);
    if (instructorImg.path) await removeBunnyFile(instructorImg.path);
    if (isUniqueError(err)) {
      return NextResponse.json(
        { error: "Slug sudah dipakai kursus lain. Ubah slug." },
        { status: 409 },
      );
    }
    console.error("[admin/courses POST] create failed", err);
    return NextResponse.json(
      { error: "Gagal menyimpan kursus. Coba lagi." },
      { status: 500 },
    );
  }
}
