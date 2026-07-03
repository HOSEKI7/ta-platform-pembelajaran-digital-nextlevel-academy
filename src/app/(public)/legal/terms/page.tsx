import type { Metadata } from "next";
import Link from "next/link";

import { TERMS_SECTIONS } from "@/lib/legal/terms-content";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - NextLevel Academy",
  description:
    "Syarat & Ketentuan penggunaan platform NextLevel Academy — hak, kewajiban, dan kebijakan layanan.",
};

function TermsSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="mb-2 font-semibold text-zinc-900">{title}</h2>
      <p
        className="text-sm leading-relaxed text-zinc-600"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <nav className="mb-6 text-xs text-zinc-400">
        <Link href="/" className="hover:text-zinc-600 transition-colors">
          Beranda
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-600">Syarat &amp; Ketentuan</span>
      </nav>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-brand-400)] to-transparent"
      />

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Syarat &amp; Ketentuan
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Berlaku efektif sejak diterbitkan. Terakhir diperbarui:{" "}
        {new Date().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        .
      </p>

      <span
        aria-hidden
        className="mt-6 mb-8 block h-px bg-gradient-to-r from-transparent via-[color:var(--color-brand-400)] to-transparent"
      />

      <div className="space-y-6">
        {TERMS_SECTIONS.map((section) => (
          <TermsSection
            key={section.title}
            title={section.title}
            body={section.body}
          />
        ))}
      </div>
    </>
  );
}
