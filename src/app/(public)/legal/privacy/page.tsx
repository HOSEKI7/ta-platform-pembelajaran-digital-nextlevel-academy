import type { Metadata } from "next";
import Link from "next/link";

import { PRIVACY_SECTIONS } from "@/lib/legal/privacy-content";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - NextLevel Academy",
  description:
    "Kebijakan Privasi NextLevel Academy — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

function PrivacySection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="mb-2 font-semibold text-zinc-900">{title}</h2>
      {/* Render body — trusted static content with safe anchor tag */}
      <p
        className="text-sm leading-relaxed text-zinc-600"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </section>
  );
}

export default function PrivacyPage() {
  const effectiveDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <nav className="mb-6 text-xs text-zinc-400">
        <Link href="/" className="hover:text-zinc-600 transition-colors">
          Beranda
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-600">Kebijakan Privasi</span>
      </nav>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-brand-400)] to-transparent"
      />

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Kebijakan Privasi
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Berlaku efektif sejak {effectiveDate}.
      </p>

      <span
        aria-hidden
        className="mt-6 mb-8 block h-px bg-gradient-to-r from-transparent via-[color:var(--color-brand-400)] to-transparent"
      />

      <div className="space-y-6">
        {PRIVACY_SECTIONS.map((section) => (
          <PrivacySection
            key={section.title}
            title={section.title}
            body={section.body}
          />
        ))}
      </div>
    </>
  );
}
