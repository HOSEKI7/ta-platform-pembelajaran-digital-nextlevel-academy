import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { requireRoleInRoute } from "@/lib/auth-server";
import { env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  AVATAR_ACCEPTED_MIME,
  AVATAR_MAX_BYTES,
} from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCEPTED_MIME_SET = new Set<string>(AVATAR_ACCEPTED_MIME);

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function pathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function POST(req: Request) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

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
    return NextResponse.json(
      { error: "File gambar wajib disertakan." },
      { status: 400 },
    );
  }
  if (!ACCEPTED_MIME_SET.has(file.type)) {
    return NextResponse.json(
      { error: "Format gambar harus PNG, JPG, atau WebP." },
      { status: 400 },
    );
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran gambar maksimum 2 MB." },
      { status: 400 },
    );
  }

  const bucket = env.supabase.avatarBucket();
  const supabase = getSupabaseAdmin();
  const objectPath = `users/${session.user.id}/${Date.now()}.${extFor(file.type)}`;

  const previousImage = session.user.image ?? null;
  const previousObjectPath = previousImage
    ? pathFromPublicUrl(previousImage, bucket)
    : null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[POST /api/account/avatar] upload failed", uploadError);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar. Coba lagi." },
      { status: 502 },
    );
  }

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  if (!publicUrl?.publicUrl) {
    return NextResponse.json(
      { error: "Gagal mendapatkan URL gambar." },
      { status: 500 },
    );
  }

  // Persist via Better Auth so the cookie cache + session.user.image stay
  // in sync (direct Prisma writes would be invisible for ~5 minutes).
  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { image: publicUrl.publicUrl },
    });
  } catch (err) {
    console.error("[POST /api/account/avatar] updateUser failed", err);
    // Roll back the upload so storage doesn't leak.
    try {
      await supabase.storage.from(bucket).remove([objectPath]);
    } catch {
      /* swallow */
    }
    return NextResponse.json(
      { error: "Gagal menyimpan foto profil." },
      { status: 500 },
    );
  }

  if (previousObjectPath) {
    try {
      await supabase.storage.from(bucket).remove([previousObjectPath]);
    } catch (err) {
      console.warn("[POST /api/account/avatar] previous cleanup failed", err);
    }
  }

  return NextResponse.json({ data: { image: publicUrl.publicUrl } });
}

export async function DELETE() {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const previousImage = session.user.image ?? null;
  if (!previousImage) {
    return NextResponse.json({ data: { image: null } });
  }

  const bucket = env.supabase.avatarBucket();
  const objectPath = pathFromPublicUrl(previousImage, bucket);

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { image: null as unknown as string },
    });
  } catch (err) {
    console.error("[DELETE /api/account/avatar] updateUser failed", err);
    return NextResponse.json(
      { error: "Gagal menghapus foto profil." },
      { status: 500 },
    );
  }

  if (objectPath) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(bucket).remove([objectPath]);
    } catch (err) {
      console.warn("[DELETE /api/account/avatar] cleanup failed", err);
    }
  }

  return NextResponse.json({ data: { image: null } });
}
