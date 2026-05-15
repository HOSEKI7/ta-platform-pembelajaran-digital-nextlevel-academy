import type { Metadata } from "next";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Minta link reset password untuk akun NextLevel Academy kamu.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
