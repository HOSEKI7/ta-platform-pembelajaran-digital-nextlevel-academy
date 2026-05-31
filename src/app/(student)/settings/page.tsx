import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAvatarOptions } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { badgeTitleForLevel } from "@/lib/gamification-types";

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
  const avatarOptions = loadAvatarOptions();

  // The identity-card badge shows the gamification title (Beginner/Explorer/
  // Scholar/Master) derived from the student's level instead of a static role.
  const game = await prisma.userGameProfile.findUnique({
    where: { userId: user.id },
    select: { level: true },
  });
  const roleLabel = badgeTitleForLevel(game?.level ?? 1);

  return (
    <StudentPageContainer>
      <SettingsView
        avatarOptions={avatarOptions}
        roleLabel={roleLabel}
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
