import { NextResponse } from "next/server";
import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  createBunnyVideo,
  isBunnyStreamAdminConfigured,
  signTusUpload,
} from "@/lib/bunny-stream-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ title: z.string().trim().min(1).max(200) });

/**
 * POST /api/admin/videos/create-upload — step 1 of the direct browser upload
 * (PRD §6.11.3). Creates an empty Bunny video object and returns a signed TUS
 * authorization so the client can upload the file straight to Bunny without it
 * passing through our server. The returned `videoGuid` is sent back when saving
 * the video step.
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  if (!isBunnyStreamAdminConfigured()) {
    return NextResponse.json(
      { error: "Bunny Stream belum dikonfigurasi di server (API key/library)." },
      { status: 502 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Judul video wajib diisi." }, { status: 400 });
  }

  try {
    const { guid } = await createBunnyVideo(parsed.data.title);
    const tus = signTusUpload(guid);
    return NextResponse.json({
      data: {
        videoGuid: tus.videoId,
        libraryId: tus.libraryId,
        signature: tus.signature,
        expires: tus.expires,
        endpoint: tus.endpoint,
      },
    });
  } catch (err) {
    console.error("[admin/videos/create-upload] failed", err);
    return NextResponse.json(
      { error: "Gagal menyiapkan unggahan video. Coba lagi." },
      { status: 502 },
    );
  }
}
