import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailStatus } from "./verify-email-status";

export const metadata: Metadata = {
  title: "Verifikasi Email",
  description: "Konfirmasi alamat email akun NextLevel Academy kamu.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailStatus />
    </Suspense>
  );
}
