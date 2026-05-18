/**
 * JSON-LD for the course catalog page.
 *
 * Emits a CollectionPage with an embedded ItemList of the courses currently
 * visible on the page — Google uses this to surface course carousels.
 */

import type { CoursesPageResult } from "@/lib/courses-query";

type Props = {
  siteUrl: string;
  category: string | null;
  page: number;
  courses: CoursesPageResult["courses"];
};

export function CatalogJsonLd({ siteUrl, category, page, courses }: Props) {
  const pageName = category ? `Kursus ${category}` : "Semua Kursus";

  const itemListElement = courses.map((c, idx) => ({
    "@type": "ListItem",
    position: (page - 1) * courses.length + idx + 1,
    url: `${siteUrl}/courses/${c.slug}`,
    name: c.title,
  }));

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${pageName} — NextLevel Academy`,
    url: `${siteUrl}/courses${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    inLanguage: "id-ID",
    isPartOf: {
      "@type": "WebSite",
      name: "NextLevel Academy",
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: courses.length,
      itemListElement,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
    />
  );
}
