import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

import { Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  changeEmailRateLimiter,
  consumeRateLimit,
  tooManyRequestsResponse,
} from "@/lib/rate-limit";
import { changeEmailSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await requireRoleInRoute([
    Role.PESERTA_DIDIK,
    Role.ADMINISTRATOR,
  ]);
  if (session instanceof Response) return session;

  // Tight cap so this can't become an email-existence oracle (keyed by userId).
  const limit = await consumeRateLimit(changeEmailRateLimiter, session.user.id);
  if (!limit.allowed) return tooManyRequestsResponse(limit.retryAfterSec);

  // Admins live under /admin; everyone else uses the student settings path.
  const settingsPath =
    session.user.role === Role.ADMINISTRATOR
      ? "/admin/settings?email=verified"
      : "/settings?email=verified";

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa JSON." },
      { status: 400 },
    );
  }

  const parsed = changeEmailSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Email tidak valid." },
      { status: 400 },
    );
  }

  const newEmail = parsed.data.newEmail.toLowerCase();
  if (newEmail === session.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Email baru harus berbeda dari email saat ini." },
      { status: 400 },
    );
  }

  // Explicit existence pre-check (user decision): return a clear 409 when the
  // target email already belongs to ANOTHER account, instead of Better Auth's
  // opaque generic success. Emails are matched literally.
  const taken = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });
  if (taken && taken.id !== session.user.id) {
    return NextResponse.json(
      { error: "Email sudah dipakai oleh akun lain." },
      { status: 409 },
    );
  }

  try {
    await auth.api.changeEmail({
      headers: await headers(),
      body: {
        newEmail,
        callbackURL: settingsPath,
      },
    });
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json(
        { error: err.body?.message ?? "Gagal memproses perubahan email." },
        { status: err.statusCode ?? 400 },
      );
    }
    console.error("[POST /api/account/email-change]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      message:
        "Tautan verifikasi telah dikirim ke email baru. Perubahan berlaku setelah kamu mengklik tautan tersebut.",
      newEmail,
    },
  });
}
