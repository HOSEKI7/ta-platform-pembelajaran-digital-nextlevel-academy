/**
 * Structured data for the landing page.
 *
 * Two schema.org entries help Google Rich Results: EducationalOrganization
 * (logo + sameAs + contact) and WebSite (search action). Embedded via a
 * single <script type="application/ld+json"> as recommended by Google.
 */

type Props = {
  siteUrl: string;
};

export function LandingJsonLd({ siteUrl }: Props) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "NextLevel Academy",
    alternateName: "NextLevel",
    url: siteUrl,
    logo: `${siteUrl}/NextLevel_3D_Logo.webp`,
    description:
      "Platform e-learning Indonesia dengan gamifikasi EXP/level/voucher dan sistem magang terintegrasi.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
    },
    sameAs: [],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NextLevel Academy",
    url: siteUrl,
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/courses?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      // schema.org JSON-LD is data, not user input — safe to inline.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([organization, website]),
      }}
    />
  );
}
