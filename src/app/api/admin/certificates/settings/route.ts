import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadCertificateExpirySetting } from "@/lib/admin-certificates-loader";
import { updateCertExpirySetting } from "@/lib/admin-certificate-write";
import { certExpirySettingSchema } from "@/lib/validations/admin-certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — current global certificate-expiry setting. */
export async function GET() {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const data = await loadCertificateExpirySetting();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/certificates/settings GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat pengaturan sertifikat." },
      { status: 500 },
    );
  }
}

/**
 * PATCH — update the global certificate-expiry setting (PRD §6.11.7).
 * Non-retroactive: affects only certificates issued afterward.
 */
export async function PATCH(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = certExpirySettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Pengaturan sertifikat tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = await updateCertExpirySetting(parsed.data, {
    actorId: auth.user.id,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan sertifikat. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { years: parsed.data.years } });
}
