import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAllCategories, loadCourseForEdit } from "@/lib/admin-course-edit-loader";

import { CourseEditView } from "@/components/admin/courses/form/course-edit-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sunting Kursus",
  description: "Perbarui informasi kursus dan susun kurikulumnya.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ courseId: string }> };

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;
  await requireRole(Role.ADMINISTRATOR, { redirectTo: `/admin/courses/${courseId}/edit` });

  const [data, categories] = await Promise.all([
    loadCourseForEdit(courseId),
    loadAllCategories(),
  ]);

  if (!data) notFound();

  return (
    <StudentPageContainer width="narrow">
      <CourseEditView data={data} categories={categories} />
    </StudentPageContainer>
  );
}
