import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { ExpRulesPanel } from "@/components/admin/gamification/exp-rules-panel";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aturan EXP",
  description: "Lihat aturan perolehan EXP, progresi level, dan reward voucher.",
  robots: { index: false, follow: false },
};

export default async function AdminExpRulesPage() {
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/gamification/exp-rules",
  });

  return (
    <StudentPageContainer width="wide">
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Admin · Gamifikasi"
          title="Aturan EXP"
          accent="& Level"
          description="Lihat aturan perolehan EXP, formula progresi level, dan reward voucher peserta didik."
        />
        <ExpRulesPanel />
      </div>
    </StudentPageContainer>
  );
}
