import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

import { Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { requireRoleInRoute } from "@/lib/auth-server";
import { changePasswordSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const guard = await requireRoleInRoute([
    Role.PESERTA_DIDIK,
    Role.PESERTA_MAGANG,
    Role.MENTOR,
  ]);
  if (guard instanceof Response) return guard;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa JSON." },
      { status: 400 },
    );
  }

  const parsed = changePasswordSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    // Better Auth's /change-password endpoint:
    //   - verifies the current password
    //   - enforces complexity via our before-hook (auth.ts)
    //   - swaps the hash
    //   - our after-hook (auth.ts) sends the notification email
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });
  } catch (err) {
    if (err instanceof APIError) {
      // Better Auth uses "INVALID_PASSWORD" for wrong current password.
      const message =
        err.body?.code === "INVALID_PASSWORD"
          ? "Password lama tidak benar."
          : (err.body?.message ?? "Gagal memperbarui password.");
      return NextResponse.json(
        { error: message },
        { status: err.statusCode ?? 400 },
      );
    }
    console.error("[POST /api/account/password]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: { message: "Password berhasil diperbarui." },
  });
}
