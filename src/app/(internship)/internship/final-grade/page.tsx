import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadFinalGrade } from "@/lib/internship-final-grade-loader";

import { InternshipEmptyState } from "@/components/internship/internship-empty-state";
import { FinalGradeView } from "@/components/internship/final-grade/final-grade-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nilai Akhir Magang",
  description: "Nilai akhir akumulasi magang yang diberikan mentor.",
  robots: { index: false, follow: false },
};

export default async function InternshipFinalGradePage() {
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/dashboard",
  });

  const data = await loadFinalGrade(session.user.id);
  if (!data) {
    return (
      <InternshipEmptyState
        eyebrow="Magang · Peserta"
        title="Nilai"
        accent="Akhir"
      />
    );
  }

  return <FinalGradeView data={data} />;
}
