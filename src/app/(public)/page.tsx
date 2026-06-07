import type { Metadata } from "next";

import { BrandMarquee } from "@/components/public/landing/brand-marquee";
import { FaqSection } from "@/components/public/landing/faq-section";
import { FeaturedCoursesSection } from "@/components/public/landing/featured-courses-section";
import { FinalCtaSection } from "@/components/public/landing/final-cta-section";
import { HeroSection } from "@/components/public/landing/hero-section";
import { HighlightsSection } from "@/components/public/landing/highlights-section";
import { HowItWorksSection } from "@/components/public/landing/how-it-works-section";
import { ScrollReveal } from "@/components/public/landing/scroll-reveal";
import { StatsStripSection } from "@/components/public/landing/stats-strip-section";
import { TestimonialsSection } from "@/components/public/landing/testimonials-section";
import { LandingJsonLd } from "@/components/public/landing/landing-jsonld";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevel.academy";

export const metadata: Metadata = {
  title: "Belajar, Naik Level, Bersertifikat",
  description:
    "Platform e-learning Indonesia dengan gamifikasi EXP/level/voucher & sistem magang terintegrasi. Akses seumur hidup, sertifikat resmi, mulai gratis hari ini.",
  keywords: [
    "kursus online",
    "e-learning Indonesia",
    "belajar coding",
    "magang online",
    "sertifikat digital",
    "NextLevel Academy",
    "kursus web programming",
    "kursus data science",
    "kursus UI UX",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "NextLevel Academy",
    title: "NextLevel Academy — Belajar, Naik Level, Bersertifikat",
    description:
      "Platform e-learning Indonesia dengan gamifikasi EXP/level/voucher & sistem magang terintegrasi.",
    images: [
      {
        url: "/NextLevel_3D_Logo.webp",
        width: 1200,
        height: 630,
        alt: "NextLevel Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NextLevel Academy — Belajar, Naik Level, Bersertifikat",
    description:
      "Gamifikasi EXP + magang terintegrasi. Akses seumur hidup. Mulai gratis.",
    images: ["/NextLevel_3D_Logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function HomePage() {
  return (
    <>
      <LandingJsonLd siteUrl={siteUrl} />
      <ScrollReveal />
      <HeroSection />
      <HighlightsSection />
      <HowItWorksSection />
      <BrandMarquee />
      <FeaturedCoursesSection />
      <StatsStripSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
