import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAvatarOptions } from "@/lib/avatars";
import { loadPlatformInfo } from "@/lib/admin-settings-loader";

import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import {
  AdminSettingsView,
  type AdminSettingsTab,
} from "@/components/admin/settings/admin-settings-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan · Admin",
  description:
    "Kelola akun administrator, identitas platform, dan status integrasi layanan NextLevel Academy.",
  robots: { index: false, follow: false },
};

const VALID_TABS: ReadonlySet<AdminSettingsTab> = new Set([
  "profil",
  "keamanan",
  "platform",
  "integrasi",
]);

function parseTab(raw: string | undefined): AdminSettingsTab {
  return raw && VALID_TABS.has(raw as AdminSettingsTab)
    ? (raw as AdminSettingsTab)
    : "profil";
}

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function AdminSettingsPage({ searchParams }: Props) {
  const session = await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/settings",
  });

  const sp = await searchParams;
  const user = session.user;
  const [avatarOptions, platformInfo] = await Promise.all([
    Promise.resolve(loadAvatarOptions()),
    loadPlatformInfo(),
  ]);

  return (
    <StudentPageContainer width="wide">
      <AdminSettingsView
        initialTab={parseTab(sp.tab)}
        avatarOptions={avatarOptions}
        platformInfo={platformInfo}
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
