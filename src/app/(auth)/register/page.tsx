import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun NextLevel Academy untuk mulai belajar dan mengumpulkan EXP. Khusus Peserta Didik.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
