import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { ExpLevelView } from "@/components/dashboard/exp-level/exp-level-view";
import {
  MOCK_BADGES,
  MOCK_GAME_PROFILE,
  MOCK_MILESTONES,
} from "@/components/dashboard/exp-level/mock-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EXP & Level",
  description:
    "Pantau level, EXP, badge, dan voucher reward kamu di NextLevel Academy.",
  robots: { index: false, follow: false },
};

export default async function ExpLevelPage() {
  await requireRole(Role.PESERTA_DIDIK, { redirectTo: "/exp-level" });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PageHeader
        eyebrow="Gamifikasi · Perjalanan Belajarmu"
        title="EXP &"
        accent="Level"
        description="Pantau capaian, klaim voucher reward, dan koleksi badge kamu di satu tempat."
      />
      <ExpLevelView
        profile={MOCK_GAME_PROFILE}
        milestones={MOCK_MILESTONES}
        badges={MOCK_BADGES}
      />
    </div>
  );
}
