import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Placeholder dashboard so the post-login redirect target exists. The real
 * Peserta Didik dashboard (PRD §6.5.3) will replace this.
 */
export default async function DashboardPage() {
  const { user } = await requireAuth({ redirectTo: "/dashboard" });
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <h1 className="font-heading text-2xl font-bold">
        Halo, {user.name.split(" ")[0]}!
      </h1>
      <p className="text-muted-foreground">
        Akun aktif sebagai{" "}
        <span className="rounded-md bg-[color:var(--color-brand-50)] px-2 py-0.5 text-xs font-medium text-[color:var(--color-brand-700)]">
          {user.role}
        </span>
        . Dashboard penuh akan dibangun selanjutnya — saat ini ini hanya stub
        agar alur login end-to-end bisa diuji.
      </p>
      <form action="/api/auth/sign-out" method="post" className="pt-2">
        <button
          type="submit"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          Keluar
        </button>
      </form>
    </main>
  );
}
