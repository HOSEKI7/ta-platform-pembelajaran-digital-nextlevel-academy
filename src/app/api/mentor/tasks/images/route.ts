import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  TASK_IMAGE_ALLOWED_TYPES,
  TASK_IMAGE_MAX_BYTES,
  isBunnyPullZoneConfigured,
  signBunnyFileUrl,
  uploadTaskImage,
} from "@/lib/bunny-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/mentor/tasks/images
 *
 * Upload a single inline image pasted/dropped into the task-description editor.
 * MENTOR only. Returns the stored Bunny object path + a freshly signed URL for
 * immediate display while editing (re-signed on every read of the saved task).
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.MENTOR);
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

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Gambar wajib disertakan." }, { status: 400 });
  }
  if (!(TASK_IMAGE_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Format gambar tidak didukung. Gunakan PNG, JPG, WEBP, atau GIF." },
      { status: 400 },
    );
  }
  if (file.size > TASK_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran gambar melebihi batas 5 MB." },
      { status: 413 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }

  let uploaded;
  try {
    uploaded = await uploadTaskImage({ mentorId: auth.user.id, file });
  } catch (err) {
    console.error("[mentor/tasks/images] upload failed", err);
    const msg =
      err instanceof Error && err.message.includes("belum dikonfigurasi")
        ? "Penyimpanan file belum dikonfigurasi di server."
        : "Gagal mengunggah gambar ke penyimpanan.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const url = isBunnyPullZoneConfigured()
    ? signBunnyFileUrl(uploaded.objectPath)
    : uploaded.objectPath;

  return NextResponse.json({ data: { path: uploaded.objectPath, url } });
}
