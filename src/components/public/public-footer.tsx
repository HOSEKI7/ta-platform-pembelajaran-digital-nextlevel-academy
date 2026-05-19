import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import { SiteContainer } from "./site-container";
import { NewsletterForm } from "./newsletter-form";
import {
  InstagramGlyph,
  LinkedinGlyph,
  TwitterGlyph,
  YoutubeGlyph,
} from "./social-icons";

type FooterLink = { label: string; href: string; comingSoon?: boolean };

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Jelajahi",
    links: [
      { label: "Semua Kursus", href: "/courses" },
      { label: "Kategori", href: "/courses?cat=all" },
      { label: "Sertifikasi", href: "/courses?type=cert" },
      { label: "Magang", href: "/about#magang" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/about" },
      { label: "Blog", href: "/blog", comingSoon: true },
      { label: "Karir", href: "/about#karir" },
      { label: "Kontak", href: "/contact" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Kebijakan Privasi", href: "/legal/privacy" },
      { label: "Syarat & Ketentuan", href: "/legal/terms" },
    ],
  },
];

const SOCIALS = [
  { icon: InstagramGlyph, label: "Instagram", href: "#" },
  { icon: TwitterGlyph, label: "Twitter / X", href: "#" },
  { icon: YoutubeGlyph, label: "YouTube", href: "#" },
  { icon: LinkedinGlyph, label: "LinkedIn", href: "#" },
];

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-zinc-100 bg-[color:var(--color-brand-50)]/40">
      {/* Top signature edge — mirrors the auth panel's gradient strip */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-brand-400)] to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-10 top-0 h-1.5 w-12 -translate-y-1/2 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_22px_var(--color-brand-accent)]"
      />

      {/* Soft corner accents */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(71,142,244,0.18) 0%, transparent 65%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 size-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,214,0,0.16) 0%, transparent 65%)",
        }}
      />

      <SiteContainer className="relative pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" aria-label="NextLevel Academy beranda" className="inline-flex items-center">
              <Image
                src="/NextLevel_LogoXFit.webp"
                alt="NextLevel Academy"
                width={1397}
                height={351}
                className="h-11 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-600">
              <span className="font-semibold text-zinc-900">Belajar dengan pace kamu.</span>{" "}
              Platform pembelajaran digital dengan gamifikasi EXP, level, dan sistem magang
              terintegrasi untuk karir digital di Indonesia.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-zinc-600">
              <li className="inline-flex items-center gap-2">
                <Mail className="size-4 text-[color:var(--color-brand-600)]" />
                <a href="mailto:halo@nextlevel.academy" className="hover:text-zinc-900">
                  halo@nextlevel.academy
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 text-[color:var(--color-brand-600)]" />
                <span>Jakarta, Indonesia · WIB (UTC+7)</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:text-[color:var(--color-brand-700)] hover:ring-[color:var(--color-brand-300)]"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-900">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.comingSoon ? (
                        <span
                          aria-disabled="true"
                          title="Segera hadir"
                          className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm text-zinc-400"
                        >
                          <span className="size-1 rounded-full bg-zinc-200" />
                          {link.label}
                          <span className="ml-1 rounded-full bg-[color:var(--color-brand-accent)]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-accent)]/40">
                            Soon
                          </span>
                        </span>
                      ) : (
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-[color:var(--color-brand-700)]"
                        >
                          <span className="size-1 rounded-full bg-zinc-300 transition group-hover:bg-[color:var(--color-brand-accent)]" />
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter column */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-900">
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-zinc-600">
              Update kursus baru, panduan karir, dan voucher eksklusif tiap dua minggu.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-zinc-200/70 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>
            © {year} <span className="font-semibold text-zinc-700">NextLevel Academy</span>. Dibuat
            dengan ❤︎ di Indonesia · WIB (UTC+7)
          </p>
          <p className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block size-1.5 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"
            />
            <span className="tracking-wide">v1.0 · Status: aktif</span>
          </p>
        </div>
      </SiteContainer>
    </footer>
  );
}
