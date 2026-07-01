import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadCoursePlayer } from "@/lib/course-player/loader";
import { prisma } from "@/lib/prisma";
import { touchEnrollment } from "@/lib/student-data-loader";

import { CoursePlayer } from "@/components/course-player/course-player";

type Params = Promise<{ slug: string }>;

async function resolveActiveSlug(slug: string): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (course) return slug;
  const history = await prisma.courseSlugHistory.findUnique({
    where: { slug },
    select: { course: { select: { slug: true } } },
  });
  return history?.course.slug ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const activeSlug = await resolveActiveSlug(slug);
  if (!activeSlug) return { title: "Materi tidak ditemukan" };
  const course = await prisma.course.findUnique({
    where: { slug: activeSlug },
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

  // Resolve old slug → current active slug; 308 redirect if stale.
  const activeSlug = await resolveActiveSlug(slug);
  if (!activeSlug) notFound();
  if (activeSlug !== slug) permanentRedirect(`/learn/${activeSlug}`);

  const data = await loadCoursePlayer(session.user.id, activeSlug);
  if (!data) notFound();

  // Fire-and-forget — bumps Enrollment.lastAccessedAt so this course floats
  // to the top of "Kursus Saya" next time the student opens it.
  void touchEnrollment(session.user.id, data.courseId);

  return <CoursePlayer data={data} />;
}
