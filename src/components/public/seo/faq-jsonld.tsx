/**
 * FAQPage structured data for Google Rich Results.
 *
 * When FAQ items appear in schema.org FAQPage format, Google can surface
 * expandable FAQ rich snippets directly in search results, increasing CTR.
 */

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  faqs: FaqItem[];
};

export function FaqJsonLd({ faqs }: Props) {
  if (faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
