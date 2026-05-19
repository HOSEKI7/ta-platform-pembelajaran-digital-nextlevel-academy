"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { PaymentDetailsCard } from "@/components/checkout/payment-details-card";
import { PaymentMethodCard } from "@/components/checkout/payment-method-card";
import {
  useCreateOrder,
  useValidateVoucher,
  type AppliedVoucher,
} from "@/hooks/use-checkout";
import type { CheckoutCourse } from "@/lib/checkout-data-loader";

type Props = {
  course: CheckoutCourse;
};

export function CheckoutForm({ course }: Props) {
  const router = useRouter();

  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateVoucher = useValidateVoucher();
  const createOrder = useCreateOrder();

  const handleApplyVoucher = (code: string) => {
    setVoucherError(null);
    validateVoucher.mutate(
      { code, courseId: course.id },
      {
        onSuccess: (data) => {
          setAppliedVoucher(data);
        },
        onError: (err) => {
          setVoucherError(err.message);
        },
      },
    );
  };

  const handleClearVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  const handleSubmit = () => {
    if (!selectedMethod || !agreedToTerms) return;
    setSubmitError(null);
    createOrder.mutate(
      {
        courseId: course.id,
        paymentMethod: selectedMethod,
        voucherCode: appliedVoucher?.code,
        agreedToTerms,
      },
      {
        onSuccess: (data) => {
          toast.success(`Pesanan #${data.orderId.slice(-8).toUpperCase()} dibuat`, {
            description:
              "Integrasi gateway pembayaran DOKU sedang dalam pengembangan. Tim admin akan menghubungimu untuk menyelesaikan pembayaran.",
          });
          // Send the student back to the dashboard with a banner-ready
          // query param. The dashboard page can later consume `?pending=...`
          // to surface a "complete your purchase" prompt.
          router.push(`/dashboard?pending=${data.orderId}`);
        },
        onError: (err) => {
          setSubmitError(err.message);
        },
      },
    );
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8 lg:px-10">
      <div className="flex flex-col gap-6">
        <OrderSummaryCard course={course} />
        <PaymentDetailsCard
          originalPrice={course.price}
          appliedVoucher={appliedVoucher}
          voucherError={voucherError}
          isApplying={validateVoucher.isPending}
          onApplyVoucher={handleApplyVoucher}
          onClearVoucher={handleClearVoucher}
        />
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <PaymentMethodCard
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
          agreedToTerms={agreedToTerms}
          onAgreedChange={setAgreedToTerms}
          onSubmit={handleSubmit}
          isSubmitting={createOrder.isPending}
          submitError={submitError}
        />
      </div>
    </div>
  );
}
