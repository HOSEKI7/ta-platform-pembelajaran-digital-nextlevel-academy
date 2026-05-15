import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Atur Ulang Password",
  description: "Buat password baru untuk akun NextLevel Academy kamu.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
