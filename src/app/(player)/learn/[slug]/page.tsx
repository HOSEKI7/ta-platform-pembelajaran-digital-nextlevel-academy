import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadCoursePlayer } from "@/lib/course-player/loader";
import { prisma } from "@/lib/prisma";
import { touchEnrollment } from "@/lib/student-data-loader";

import { CoursePlayer } from "@/components/course-player/course-player";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true },
  });
  if (!course) return { title: "Materi tidak ditemukan" };
  return {
    title: `Belajar · ${course.title}`,
    description: `Mode belajar untuk ${course.title} — fokus, tanpa distraksi.`,
  };
}

export default async function LearnPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: `/learn/${slug}`,
  });

  const data = await loadCoursePlayer(session.user.id, slug);
  if (!data) notFound();

  // Fire-and-forget — bumps Enrollment.lastAccessedAt so this course floats
  // to the top of "Kursus Saya" next time the student opens it.
  void touchEnrollment(session.user.id, data.courseId);

  return <CoursePlayer data={data} />;
}
