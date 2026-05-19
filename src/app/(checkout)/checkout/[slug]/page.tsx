import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadCheckoutPageData } from "@/lib/checkout-data-loader";

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
  if (result.status === "pending") redirect(`/dashboard?pending=${result.orderId}`);

  return <CheckoutForm course={result.course} />;
}
