import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { SettingsView } from "@/components/dashboard/settings/settings-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
  description:
    "Kelola identitas, foto profil, email, dan keamanan akun NextLevel Academy.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/settings",
  });

  const user = session.user;

  return (
    <StudentPageContainer>
      <SettingsView
        initial={{
          id: user.id,
          name: user.name,
          username: user.username ?? "",
          email: user.email,
          image: user.image ?? null,
          emailVerified: user.emailVerified,
          createdAt:
            user.createdAt instanceof Date
              ? user.createdAt.toISOString()
              : new Date(user.createdAt as unknown as string).toISOString(),
        }}
      />
    </StudentPageContainer>
  );
}
