import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { renderTransactionReceiptPdf } from "@/lib/transactions/transaction-receipt-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { id } = await params;

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        status: true,
        paymentInvoiceId: true,
        paymentMethod: true,
        originalPrice: true,
        discountAmount: true,
        finalPrice: true,
        createdAt: true,
        paidAt: true,
        voucher: { select: { code: true } },
        course: { select: { title: true } },
      },
    });

    // Owner-scoped already (userId in where); a foreign id is simply "not found".
    if (!order) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 },
      );
    }

    // A receipt only exists for a paid order.
    if (order.status !== "SUCCESS") {
      return NextResponse.json(
        { error: "Bukti transaksi hanya tersedia untuk transaksi berhasil." },
        { status: 409 },
      );
    }

    const buffer = await renderTransactionReceiptPdf({
      transactionId: order.id,
      invoiceId: order.paymentInvoiceId,
      customerName: session.user.name,
      courseTitle: order.course.title,
      paymentMethod: order.paymentMethod,
      originalPrice: order.originalPrice,
      discountAmount: order.discountAmount,
      finalPrice: order.finalPrice,
      voucherCode: order.voucher?.code ?? null,
      checkoutAt: order.createdAt,
      paidAt: order.paidAt,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Bukti-Transaksi-${order.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/student/transactions/:id/receipt]", err);
    return NextResponse.json(
      { error: "Gagal membuat bukti transaksi." },
      { status: 500 },
    );
  }
}
