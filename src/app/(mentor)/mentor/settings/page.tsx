import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAvatarOptions } from "@/lib/avatars";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { SettingsView } from "@/components/dashboard/settings/settings-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan Akun · Mentor",
  description:
    "Kelola identitas, foto profil, dan keamanan akun mentor NextLevel Academy. Email dikelola administrator program.",
  robots: { index: false, follow: false },
};

export default async function MentorSettingsPage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/settings",
  });

  const user = session.user;
  const avatarOptions = loadAvatarOptions();

  return (
    <StudentPageContainer>
      <SettingsView
        lockEmail
        roleLabel="Mentor"
        headerDescription="Atur identitas, foto, dan keamanan akun mentormu di NextLevel Academy. Email mentor dikelola administrator dan tidak dapat diubah dari halaman ini."
        lockEmailHelper="Email akun mentor dikelola administrator dan tidak dapat diubah dari halaman ini."
        lockEmailNote="Email mentor ditetapkan oleh administrator program. Bila kamu perlu mengubahnya, hubungi administrator NextLevel Academy."
        avatarOptions={avatarOptions}
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
