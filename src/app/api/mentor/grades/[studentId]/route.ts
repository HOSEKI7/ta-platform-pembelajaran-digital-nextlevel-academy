import { NextResponse } from "next/server";

import { NotificationType, Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { upsertGradeSchema } from "@/lib/validations/mentor-grade";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUT /api/mentor/grades/[studentId]
 *
 * Assign or update a mentee's final grade (PRD §6.9.4). A single upsert handles
 * both "Beri Nilai" and "Edit Nilai"; `gradedAt` is stamped once on first
 * grading. Class-scoped to the mentor — the student must belong to their class.
 */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ studentId: string }> },
) {
  const auth = await requireRoleInRoute(Role.MENTOR);
  if (auth instanceof Response) return auth;
  const mentorId = auth.user.id;

  const { studentId } = await ctx.params;

  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: mentorId },
    select: { classId: true },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Anda belum ditugaskan ke kelas mana pun." },
      { status: 404 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = upsertGradeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const { grade } = parsed.data;
  const note = parsed.data.note?.trim() ? parsed.data.note.trim() : null;

  // The student must be a mentee in the mentor's own class.
  const mentee = await prisma.internshipProfile.findFirst({
    where: { userId: studentId, classId: profile.classId },
    select: { id: true },
  });
  if (!mentee) {
    return NextResponse.json(
      { error: "Peserta tidak ditemukan di kelas Anda." },
      { status: 404 },
    );
  }

  // Check if grade is locked by admin
  const existingGrade = await prisma.finalGrade.findUnique({
    where: { studentId },
    select: { isLocked: true },
  });
  if (existingGrade?.isLocked) {
    return NextResponse.json(
      { error: "Nilai peserta ini telah dikunci oleh admin dan tidak dapat diubah." },
      { status: 403 },
    );
  }

  try {
    // Upsert the grade and notify the mentee in one tx (PRD §6.12) — fires on
    // both first grading and edits so the peserta-magang always knows their
    // final grade was set/changed.
    await prisma.$transaction([
      prisma.finalGrade.upsert({
        where: { studentId },
        create: {
          studentId,
          mentorId,
          grade,
          note,
          gradedAt: new Date(),
          lastEditedById: mentorId,
        },
        update: { grade, note, lastEditedById: mentorId },
      }),
      prisma.notification.create({
        data: {
          userId: studentId,
          type: NotificationType.FINAL_GRADE_POSTED,
          title: "Nilai akhir magang sudah keluar",
          message: `Mentor telah mengisi nilai akhir magang kamu: ${grade}. Lihat detailnya di halaman Nilai Akhir.`,
          refId: studentId,
        },
      }),
    ]);
  } catch (err) {
    console.error("[mentor/grades] db write failed", err);
    return NextResponse.json(
      { error: "Gagal menyimpan nilai. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
