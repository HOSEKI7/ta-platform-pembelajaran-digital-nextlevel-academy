/**
 * JSON-LD for a course detail page.
 *
 * Emits schema.org Course + an Offer block with IDR pricing so Google can
 * surface the course in education-related rich results.
 */

type Props = {
  siteUrl: string;
  course: {
    title: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    thumbnailUrl: string;
    price: number;
    instructor: string;
    category: { name: string };
    estimatedDuration: number | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export function CourseJsonLd({ siteUrl, course }: Props) {
  const url = `${siteUrl}/courses/${course.slug}`;
  const description = course.shortDescription ?? course.description.slice(0, 240);

  const json = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description,
    url,
    inLanguage: "id-ID",
    image: course.thumbnailUrl,
    provider: {
      "@type": "EducationalOrganization",
      name: "NextLevel Academy",
      sameAs: siteUrl,
    },
    instructor: {
      "@type": "Person",
      name: course.instructor,
    },
    about: course.category.name,
    educationalLevel: "Beginner",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "IDR",
      price: course.price,
      availability: "https://schema.org/InStock",
      category: "Paid",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: course.estimatedDuration
        ? `PT${Math.max(1, Math.round(course.estimatedDuration / 60))}H`
        : undefined,
    },
    datePublished: course.createdAt.toISOString(),
    dateModified: course.updatedAt.toISOString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
