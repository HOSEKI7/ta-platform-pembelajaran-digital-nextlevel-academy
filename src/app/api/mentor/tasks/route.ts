import { NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";

import { NotificationType, Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { removeBunnyFile, uploadTaskAttachment } from "@/lib/bunny-storage";
import { normalizeTaskDescriptionImages } from "@/lib/task-description";
import { createTaskSchema } from "@/lib/validators/mentor-tasks";
import {
  SUBMISSION_ALLOWED_EXTS,
  SUBMISSION_MAX_BYTES,
  getFileExt,
} from "@/components/internship/tasks/task-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIB_TZ = "Asia/Jakarta";

/**
 * POST /api/mentor/tasks
 *
 * Create a class task (PRD §6.9.3). MENTOR only and server-authoritative: the
 * class/field/batch are taken from the mentor's own profile (never the client),
 * which is exactly what makes the task class-scoped for both mentees and the
 * mentor. Mirrors the submission route's upload-then-DB ordering with rollback.
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.MENTOR);
  if (auth instanceof Response) return auth;

  // Mentor's class chain — the single source of truth for task scoping.
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: auth.user.id },
    select: {
      classId: true,
      class: {
        select: { fieldId: true, field: { select: { batchId: true } } },
      },
    },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Anda belum ditugaskan ke kelas mana pun." },
      { status: 404 },
    );
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

  // Validate text fields with the shared schema.
  const parsed = createTaskSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    deadline: form.get("deadline"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const { title, description, deadline } = parsed.data;

  // Deadline: interpret the wall-clock value as WIB, store as UTC, reject past.
  const deadlineUtc = fromZonedTime(deadline, WIB_TZ);
  if (Number.isNaN(deadlineUtc.getTime())) {
    return NextResponse.json({ error: "Tenggat tidak valid." }, { status: 400 });
  }
  if (deadlineUtc.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Tenggat harus di masa depan." },
      { status: 400 },
    );
  }

  // Description images → validated Bunny paths; enforce the 1-image cap.
  const { html: normalizedDescription, imageCount } =
    normalizeTaskDescriptionImages(description);
  if (imageCount > 1) {
    return NextResponse.json(
      { error: "Maksimal 1 gambar per deskripsi." },
      { status: 400 },
    );
  }

  // Optional supporting attachment (PDF/DOCX/ZIP ≤ 5 MB).
  const rawFile = form.get("file");
  let attachment: { objectPath: string; fileName: string; fileSize: number } | null =
    null;
  if (rawFile instanceof File && rawFile.size > 0) {
    const ext = getFileExt(rawFile.name);
    if (!(SUBMISSION_ALLOWED_EXTS as readonly string[]).includes(ext)) {
      return NextResponse.json(
        { error: "Format lampiran tidak didukung. Gunakan PDF, DOCX, atau ZIP." },
        { status: 400 },
      );
    }
    if (rawFile.size > SUBMISSION_MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran lampiran melebihi batas 5 MB." },
        { status: 413 },
      );
    }
    try {
      attachment = await uploadTaskAttachment({ mentorId: auth.user.id, file: rawFile });
    } catch (err) {
      console.error("[mentor/tasks] attachment upload failed", err);
      const msg =
        err instanceof Error && err.message.includes("belum dikonfigurasi")
          ? "Penyimpanan file belum dikonfigurasi di server."
          : "Gagal mengunggah lampiran ke penyimpanan.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  // Create the task + notify every mentee in the class — one transaction.
  let taskId: string;
  try {
    taskId = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          mentorId: auth.user.id,
          classId: profile.classId,
          fieldId: profile.class.fieldId,
          batchId: profile.class.field.batchId,
          title,
          description: normalizedDescription,
          deadline: deadlineUtc,
          attachmentUrl: attachment?.objectPath ?? null,
          attachmentName: attachment?.fileName ?? null,
          attachmentSize: attachment?.fileSize ?? null,
        },
        select: { id: true },
      });

      const mentees = await tx.internshipProfile.findMany({
        where: { classId: profile.classId },
        select: { userId: true },
      });
      if (mentees.length > 0) {
        await tx.notification.createMany({
          data: mentees.map((m) => ({
            userId: m.userId,
            type: NotificationType.TASK_ASSIGNED,
            title: "Tugas baru",
            message: `Mentor memberikan tugas baru: "${title}".`,
            refId: task.id,
          })),
        });
      }

      return task.id;
    });
  } catch (err) {
    console.error("[mentor/tasks] db write failed", err);
    if (attachment) await removeBunnyFile(attachment.objectPath);
    return NextResponse.json(
      { error: "Gagal menyimpan tugas. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { id: taskId } }, { status: 201 });
}
