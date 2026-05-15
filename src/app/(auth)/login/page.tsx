import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun NextLevel Academy kamu untuk melanjutkan belajar.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
