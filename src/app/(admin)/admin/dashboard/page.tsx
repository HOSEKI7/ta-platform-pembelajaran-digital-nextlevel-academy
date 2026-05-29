import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAdminDashboard } from "@/lib/admin-data-loader";

import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description:
    "Analytics platform: pendapatan, transaksi, pertumbuhan pengguna, kursus, dan sertifikat.",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/dashboard",
  });
  const firstName = session.user.name.split(" ")[0] ?? session.user.name;

  // Capture "now" on the server so the live clock's first client render matches.
  const serverNowISO = new Date().toISOString();

  const data = await loadAdminDashboard();

  return (
    <AdminDashboard
      firstName={firstName}
      serverNowISO={serverNowISO}
      data={data}
    />
  );
}
