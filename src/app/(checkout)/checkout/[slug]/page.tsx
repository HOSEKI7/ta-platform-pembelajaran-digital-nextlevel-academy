import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadCheckoutPageData } from "@/lib/checkout-data-loader";
import { env } from "@/lib/env";

import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pembelian kursus NextLevel Academy.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ slug: string }>;

export default async function CheckoutPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: `/checkout/${slug}`,
  });

  const result = await loadCheckoutPageData(session.user.id, slug);

  if (result.status === "not-found") notFound();
  if (result.status === "owned") redirect("/dashboard?owned=1");

  const clientKey = env.midtrans.clientKey() ?? "";
  const isProduction = env.midtrans.isProduction();

  // A live PENDING order already exists — resume it (reopen Snap) in place.
  if (result.status === "pending") {
    return (
      <CheckoutForm
        course={result.course}
        clientKey={clientKey}
        isProduction={isProduction}
        resume={result.resume}
        customer={{ name: session.user.name, email: session.user.email }}
      />
    );
  }

  return (
    <CheckoutForm
      course={result.course}
      clientKey={clientKey}
      isProduction={isProduction}
      lastPhone={result.lastPhone}
      customer={{ name: session.user.name, email: session.user.email }}
    />
  );
}
