import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";

import { loadPlatformInfo } from "@/lib/platform-info";
import { ContactForm } from "@/components/public/contact-form";
import { SiteContainer } from "@/components/public/site-container";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi tim NextLevel Academy via email, WhatsApp, atau formulir kontak. Kami di Medan, Indonesia — biasanya balas dalam 1 hari kerja.",
  keywords: [
    "kontak NextLevel Academy",
    "hubungi kami",
    "customer support e-learning",
    "NextLevel Academy Medan",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/contact",
    siteName: "NextLevel Academy",
    title: "Kontak · NextLevel Academy",
    description:
      "Hubungi tim NextLevel Academy via email, WhatsApp, atau formulir kontak.",
  },
  twitter: {
    card: "summary",
    title: "Kontak · NextLevel Academy",
    description: "Hubungi NextLevel Academy — email, WhatsApp, formulir kontak.",
  },
};
export const revalidate = 300;

type Info = {
  icon: typeof Mail;
  label: string;
  value: string;
  hint: string;
  href?: string;
};

export default async function ContactPage() {
  const info = await loadPlatformInfo();

  // DB-backed with graceful fallbacks so the page never looks empty before an
  // admin fills in Informasi Platform (PRD §6.11.11).
  const email = info.emailKontak.trim() || "nextlevelacademy@gmail.com";
  const whatsapp = info.nomorWhatsapp.trim() || "+62 821 2270 1170";
  const waDigits = whatsapp.replace(/\D/g, "");
  const alamat =
    info.alamat.trim() ||
    "Jl. Sederhana Komplek Graha Swadaya, Tembung, Kec. Percut Sei Tuan, Sumatera Utara";
  const lokasi = [info.kota.trim(), info.negara.trim()].filter(Boolean).join(" · ");
  const jamOperasional = info.jamOperasional.trim() || "Senin – Jumat, 09:00 – 18:00";

  const INFOS: Info[] = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      hint: "Untuk pertanyaan umum & kerja sama",
      href: `mailto:${email}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: whatsapp,
      hint: "Sapa langsung lewat WhatsApp",
      href: waDigits ? `https://wa.me/${waDigits}` : undefined,
    },
    {
      icon: MapPin,
      label: "Alamat",
      value: alamat,
      hint: lokasi || "Indonesia · WIB (UTC+7)",
    },
    {
      icon: Clock,
      label: "Jam operasional",
      value: jamOperasional,
      hint: "Respons rata-rata < 1 hari kerja",
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 85% 0%, rgba(71,142,244,0.18) 0%, transparent 42%)," +
              "linear-gradient(180deg, rgba(238,245,255,0.7) 0%, rgba(255,255,255,1) 65%)",
          }}
        />
        <SiteContainer>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-200)] backdrop-blur">
            <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)]" />
            Kontak
          </span>
          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Ada pertanyaan?{" "}
            <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
              Kami senang mendengar dari kamu.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Kirim pesan, follow akun resmi kami, atau sapa langsung lewat
            WhatsApp — apa pun yang paling nyaman. Tim kami akan membalas dalam
            1 hari kerja.
          </p>
        </SiteContainer>
      </section>

      <section className="pb-24">
        <SiteContainer>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            {/* Info */}
            <div className="grid gap-4 self-start">
              {INFOS.map(({ icon: Icon, label, value, hint, href }) => {
                const Content = (
                  <div className="group relative flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:ring-[color:var(--color-brand-300)]">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
                      <Icon className="size-5" strokeWidth={2.1} />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        {label}
                      </div>
                      <div className="mt-1 font-heading text-base font-bold text-zinc-900">
                        {value}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500">{hint}</div>
                    </div>
                  </div>
                );
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {Content}
                  </a>
                ) : (
                  <div key={label}>{Content}</div>
                );
              })}
            </div>

            {/* Form */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-zinc-200 sm:p-9">
              <span
                aria-hidden
                className="absolute -right-8 -top-8 h-20 w-20 rotate-45 bg-[color:var(--color-brand-accent)]/85"
              />
              <h2 className="font-heading text-xl font-bold text-zinc-900">
                Kirim pesan
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500">
                Isi formulir berikut dan tim kami akan menghubungi kembali.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </SiteContainer>
      </section>
    </>
  );
}
