import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoursePlayer } from "@/components/course-player/course-player";
import { findCourseBySlug } from "@/lib/course-player/mock-course";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = findCourseBySlug(slug);
  if (!course) {
    return { title: "Materi tidak ditemukan" };
  }
  return {
    title: `Belajar · ${course.title}`,
    description: `Mode belajar untuk ${course.title} — fokus, tanpa distraksi.`,
  };
}

export default async function LearnPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = findCourseBySlug(slug);
  if (!course) notFound();

  return <CoursePlayer course={course} />;
}
