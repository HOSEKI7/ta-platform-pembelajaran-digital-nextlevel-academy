import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAvatarOptions } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { SettingsView } from "@/components/dashboard/settings/settings-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan Akun · Peserta Magang",
  description:
    "Kelola identitas, foto profil, dan keamanan akun magang NextLevel Academy. Email dikelola administrator program.",
  robots: { index: false, follow: false },
};

export default async function InternshipSettingsPage() {
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/settings",
  });

  const user = session.user;
  const avatarOptions = loadAvatarOptions();

  const profile = await prisma.internshipProfile.findUnique({
    where: { userId: user.id },
    select: { institution: true },
  });
  const institutionValue = profile?.institution?.trim() || null;

  return (
    <StudentPageContainer>
      <SettingsView
        lockEmail
        roleLabel="Peserta Magang"
        avatarOptions={avatarOptions}
        institution={{
          value: institutionValue,
          locked: Boolean(institutionValue),
        }}
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
