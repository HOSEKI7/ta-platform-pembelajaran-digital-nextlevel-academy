import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  TASK_IMAGE_ALLOWED_TYPES,
  TASK_IMAGE_MAX_BYTES,
  isBunnyPullZoneConfigured,
  signBunnyFileUrl,
  uploadBadgeIcon,
} from "@/lib/bunny-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/badges/icons — upload a single custom badge icon
 * (PRD §6.11.8). ADMINISTRATOR only. Returns the stored Bunny object path
 * (persisted on `Badge.logoUrl`) + a freshly signed URL for preview. Mirrors
 * `/api/admin/quiz/images`.
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
    return NextResponse.json({ error: "Ukuran gambar melebihi batas 5 MB." }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }

  let uploaded;
  try {
    uploaded = await uploadBadgeIcon({ adminId: auth.user.id, file });
  } catch (err) {
    console.error("[admin/badges/icons] upload failed", err);
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
