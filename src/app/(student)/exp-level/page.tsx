import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadExpLevelPage } from "@/lib/gamification";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { ExpLevelView } from "@/components/dashboard/exp-level/exp-level-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EXP & Level",
  description:
    "Pantau level, EXP, badge, dan voucher reward kamu di NextLevel Academy.",
  robots: { index: false, follow: false },
};

export default async function ExpLevelPage() {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/exp-level",
  });

  const { summary, badges, vouchers } = await loadExpLevelPage(session.user.id);

  return (
    <StudentPageContainer>
      <PageHeader
        eyebrow="Gamifikasi · Perjalanan Belajarmu"
        title="EXP &"
        accent="Level"
        description="Pantau capaian, klaim voucher reward, dan koleksi badge kamu di satu tempat."
      />
      <ExpLevelView summary={summary} badges={badges} vouchers={vouchers} />
    </StudentPageContainer>
  );
}
