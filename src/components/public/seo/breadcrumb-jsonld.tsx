/**
 * BreadcrumbList structured data for Google Rich Results.
 *
 * Google displays breadcrumb trails in search snippets when proper
 * BreadcrumbList schema is present, improving navigation context.
 */

type BreadcrumbItem = {
  name: string;
  href: string;
};

type Props = {
  siteUrl: string;
  items: BreadcrumbItem[];
};

export function BreadcrumbJsonLd({ siteUrl, items }: Props) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
