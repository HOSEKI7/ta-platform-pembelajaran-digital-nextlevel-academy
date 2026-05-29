import { NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  isExternalUrl,
  removeBunnyFile,
  uploadTaskAttachment,
} from "@/lib/bunny-storage";
import {
  extractTaskImagePaths,
  normalizeTaskDescriptionImages,
} from "@/lib/task-description";
import { createTaskSchema } from "@/lib/validators/mentor-tasks";
import {
  SUBMISSION_ALLOWED_EXTS,
  SUBMISSION_MAX_BYTES,
  getFileExt,
} from "@/components/internship/tasks/task-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIB_TZ = "Asia/Jakarta";

/** Resolve the mentor's class id, or a 4xx Response if not assigned. */
async function mentorClassId(userId: string): Promise<string | Response> {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: { classId: true },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Anda belum ditugaskan ke kelas mana pun." },
      { status: 404 },
    );
  }
  return profile.classId;
}

/**
 * PUT /api/mentor/tasks/[taskId] — edit a task (title, rich-text description,
 * deadline, attachment). Class-scoped to the mentor. Unlike create, the deadline
 * is NOT forced into the future so an unchanged past deadline stays valid.
 */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ taskId: string }> },
) {
  const auth = await requireRoleInRoute(Role.MENTOR);
  if (auth instanceof Response) return auth;
  const classId = await mentorClassId(auth.user.id);
  if (classId instanceof Response) return classId;

  const { taskId } = await ctx.params;
  const task = await prisma.task.findFirst({
    where: { id: taskId, classId },
    select: { id: true, attachmentUrl: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
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

  const deadlineUtc = fromZonedTime(deadline, WIB_TZ);
  if (Number.isNaN(deadlineUtc.getTime())) {
    return NextResponse.json({ error: "Tenggat tidak valid." }, { status: 400 });
  }

  const { html: normalizedDescription, imageCount } =
    normalizeTaskDescriptionImages(description);
  if (imageCount > 1) {
    return NextResponse.json(
      { error: "Maksimal 1 gambar per deskripsi." },
      { status: 400 },
    );
  }

  // Attachment intent. "replace" without a file degrades to "keep".
  const rawFile = form.get("file");
  const hasNewFile = rawFile instanceof File && rawFile.size > 0;
  let action = form.get("attachmentAction");
  if (action === "replace" && !hasNewFile) action = "keep";

  const updateData: {
    title: string;
    description: string;
    deadline: Date;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentSize?: number | null;
  } = { title, description: normalizedDescription, deadline: deadlineUtc };

  let uploadedPath: string | null = null;
  let oldToRemove: string | null = null;

  if (action === "remove") {
    updateData.attachmentUrl = null;
    updateData.attachmentName = null;
    updateData.attachmentSize = null;
    oldToRemove = task.attachmentUrl;
  } else if (action === "replace" && hasNewFile) {
    const file = rawFile;
    const ext = getFileExt(file.name);
    if (!(SUBMISSION_ALLOWED_EXTS as readonly string[]).includes(ext)) {
      return NextResponse.json(
        { error: "Format lampiran tidak didukung. Gunakan PDF, DOCX, atau ZIP." },
        { status: 400 },
      );
    }
    if (file.size > SUBMISSION_MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran lampiran melebihi batas 5 MB." },
        { status: 413 },
      );
    }
    try {
      const uploaded = await uploadTaskAttachment({ mentorId: auth.user.id, file });
      uploadedPath = uploaded.objectPath;
      updateData.attachmentUrl = uploaded.objectPath;
      updateData.attachmentName = uploaded.fileName;
      updateData.attachmentSize = uploaded.fileSize;
      oldToRemove = task.attachmentUrl;
    } catch (err) {
      console.error("[mentor/tasks PUT] attachment upload failed", err);
      return NextResponse.json(
        { error: "Gagal mengunggah lampiran ke penyimpanan." },
        { status: 502 },
      );
    }
  }

  try {
    await prisma.task.update({ where: { id: task.id }, data: updateData });
  } catch (err) {
    console.error("[mentor/tasks PUT] db update failed", err);
    if (uploadedPath) await removeBunnyFile(uploadedPath);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan. Coba lagi." },
      { status: 500 },
    );
  }

  // Best-effort cleanup of the replaced/removed file (Bunny object paths only).
  if (oldToRemove && !isExternalUrl(oldToRemove) && oldToRemove !== uploadedPath) {
    removeBunnyFile(oldToRemove).catch(() => {});
  }

  return NextResponse.json({ data: { id: task.id } });
}

/**
 * DELETE /api/mentor/tasks/[taskId] — permanently delete a task and (cascade)
 * its submissions, then best-effort remove all related Bunny blobs.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ taskId: string }> },
) {
  const auth = await requireRoleInRoute(Role.MENTOR);
  if (auth instanceof Response) return auth;
  const classId = await mentorClassId(auth.user.id);
  if (classId instanceof Response) return classId;

  const { taskId } = await ctx.params;
  const task = await prisma.task.findFirst({
    where: { id: taskId, classId },
    select: {
      id: true,
      attachmentUrl: true,
      description: true,
      submissions: { select: { submissionUrl: true } },
    },
  });
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }

  // Collect Bunny object paths to clean up after the row is gone.
  const paths = new Set<string>();
  if (task.attachmentUrl && !isExternalUrl(task.attachmentUrl)) {
    paths.add(task.attachmentUrl);
  }
  for (const path of extractTaskImagePaths(task.description)) paths.add(path);
  for (const s of task.submissions) {
    if (s.submissionUrl && !isExternalUrl(s.submissionUrl)) paths.add(s.submissionUrl);
  }

  try {
    await prisma.task.delete({ where: { id: task.id } });
  } catch (err) {
    console.error("[mentor/tasks DELETE] db delete failed", err);
    return NextResponse.json(
      { error: "Gagal menghapus tugas. Coba lagi." },
      { status: 500 },
    );
  }

  await Promise.all([...paths].map((path) => removeBunnyFile(path)));

  return NextResponse.json({ data: { ok: true } });
}
