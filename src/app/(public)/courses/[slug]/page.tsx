import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { dashboardHrefFor } from "@/components/public/public-nav-config";

import { CourseAbout } from "@/components/public/landing/course-detail/course-about";
import { CourseBenefitsBlock } from "@/components/public/landing/course-detail/course-benefits-block";
import { CourseCurriculum } from "@/components/public/landing/course-detail/course-curriculum";
import { CourseFaqBlock } from "@/components/public/landing/course-detail/course-faq-block";
import { CourseHero } from "@/components/public/landing/course-detail/course-hero";
import { CourseJsonLd } from "@/components/public/landing/course-detail/course-jsonld";
import { CourseMentorBlock } from "@/components/public/landing/course-detail/course-mentor-block";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevel.academy";

type Props = { params: Promise<{ slug: string }> };

async function loadCourse(slug: string) {
  return prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true } },
      benefits: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      sprints: {
        orderBy: { order: "asc" },
        include: { steps: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) {
    return {
      title: "Kursus tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description =
    course.shortDescription?.trim() ||
    course.description.slice(0, 200).replace(/\s+\S*$/, "") + "…";

  const canonical = `/courses/${course.slug}`;
  const ogImage = course.thumbnailUrl;

  return {
    title: course.title,
    description,
    keywords: [
      course.title,
      course.category.name,
      "kursus online",
      "NextLevel Academy",
      course.instructor,
      "sertifikat",
      "akses seumur hidup",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonical,
      siteName: "NextLevel Academy",
      title: `${course.title} · NextLevel Academy`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} · NextLevel Academy`,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    other: {
      "course:instructor": course.instructor,
      "course:category": course.category.name,
      "product:price:amount": String(course.price),
      "product:price:currency": "IDR",
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const [course, session] = await Promise.all([loadCourse(slug), getSession()]);
  if (!course) notFound();

  const totalSteps = course.sprints.reduce((acc, s) => acc + s.steps.length, 0);

  const enrollHref = session
    ? dashboardHrefFor(session.user.role)
    : `/login?next=${encodeURIComponent(`/courses/${slug}`)}`;

  return (
    <>
      <CourseJsonLd siteUrl={siteUrl} course={course} />
      <CourseHero
        title={course.title}
        shortDescription={course.shortDescription}
        description={course.description}
        thumbnailUrl={course.thumbnailUrl}
        category={course.category}
        instructor={course.instructor}
        price={course.price}
        fakePrice={course.fakePrice}
        estimatedDuration={course.estimatedDuration}
        totalSteps={totalSteps}
        enrollHref={enrollHref}
      />
      <CourseAbout description={course.description} />
      <CourseBenefitsBlock benefits={course.benefits} />
      <CourseMentorBlock instructor={course.instructor} bio={course.instructorBio} />
      <CourseCurriculum
        sprints={course.sprints.map((s) => ({
          id: s.id,
          title: s.title,
          order: s.order,
          steps: s.steps.map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            type: step.type,
            order: step.order,
          })),
        }))}
      />
      <CourseFaqBlock faqs={course.faqs} />
    </>
  );
}
