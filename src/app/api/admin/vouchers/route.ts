import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminVouchersPage } from "@/lib/admin-vouchers-loader";
import {
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-vouchers-query";
import { createVoucher, describeVoucherFailure } from "@/lib/admin-voucher-write";
import { voucherFormSchema } from "@/lib/validations/admin-voucher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/vouchers — paginated, searchable, filterable list of admin-created
 * vouchers (excludes system-generated reward vouchers). Gated to ADMINISTRATOR.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const data = await loadAdminVouchersPage({
      page: parsePage(searchParams.get("page")),
      status: parseStatus(searchParams.get("status")),
      sort: parseSort(searchParams.get("sort")),
      search: parseSearch(searchParams.get("search")),
    });
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/vouchers GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar voucher." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/vouchers — create a new admin voucher (PRD §6.11.6). Validates
 * the body, rejects past expiry dates, and records the action in AuditLog.
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = voucherFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data voucher tidak valid." },
      { status: 400 },
    );
  }

  if (new Date(parsed.data.endDate) <= new Date()) {
    return NextResponse.json(
      { error: "Tanggal berakhir harus di masa depan." },
      { status: 400 },
    );
  }

  const result = await createVoucher(parsed.data, {
    actorId: auth.user.id,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    const { status, error } = describeVoucherFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
