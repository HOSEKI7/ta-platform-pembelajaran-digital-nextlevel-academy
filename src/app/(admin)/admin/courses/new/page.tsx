import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAllCategories } from "@/lib/admin-course-edit-loader";

import { CreateCourseView } from "@/components/admin/courses/form/create-course-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tambah Kursus",
  description: "Buat kursus baru sebagai draf, lalu susun kurikulumnya.",
  robots: { index: false, follow: false },
};

export default async function NewCoursePage() {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/courses/new" });

  const categories = await loadAllCategories();

  return (
    <StudentPageContainer width="narrow">
      <CreateCourseView categories={categories} />
    </StudentPageContainer>
  );
}
