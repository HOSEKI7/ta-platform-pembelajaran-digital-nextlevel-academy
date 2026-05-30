import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { validateVoucher } from "@/lib/checkout-data-loader";
import { prisma } from "@/lib/prisma";
import { validateVoucherSchema } from "@/lib/validators/checkout";

export const dynamic = "force-dynamic";

/**
 * POST /api/vouchers/validate
 *
 * Body: `{ code: string, courseId: string }`
 *
 * Lightweight validation pass used by the checkout page to preview a voucher
 * before the student submits the order. Does NOT mutate state — `VoucherUsage`
 * is only created when an Order is actually placed. Atomicity is enforced at
 * order-creation time (POST /api/orders) inside a `prisma.$transaction`.
 */
export async function POST(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const parsed = validateVoucherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 },
    );
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { id: true, categoryId: true, price: true, status: true },
    });
    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    const result = await validateVoucher({
      code: parsed.data.code,
      userId: session.user.id,
      course: {
        id: course.id,
        categoryId: course.categoryId,
        price: course.price,
      },
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      data: {
        code: result.voucher.code,
        description: result.voucher.description,
        discountType: result.voucher.discountType,
        discountPct: result.voucher.discountPct,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice,
      },
    });
  } catch (err) {
    console.error("[POST /api/vouchers/validate]", err);
    return NextResponse.json(
      { error: "Gagal memvalidasi voucher." },
      { status: 500 },
    );
  }
}
