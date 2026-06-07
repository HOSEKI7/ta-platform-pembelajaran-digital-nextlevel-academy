import { Plus } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { SiteContainer } from "../site-container";

const FAQS = [
  {
    q: "Apakah saya benar-benar mendapat akses seumur hidup?",
    a: "Ya. Setelah pembelian berhasil, kursus akan otomatis terdaftar di akun kamu dan dapat diakses kapan saja, tanpa biaya berlangganan. Update materi pun gratis selama kursus aktif.",
  },
  {
    q: "Bagaimana sistem EXP, level, dan voucher bekerja?",
    a: "Tiap video selesai memberi +15 XP, quiz pertama yang lulus +90 XP, dan kursus tuntas +600 XP. Naik level akan mereset EXP ke 0 tetapi totalExp tetap kumulatif. Voucher otomatis terbit di Level 5 (20%), 10 (35%), dan 15 (50%).",
  },
  {
    q: "Apakah sertifikatnya valid dan bisa diverifikasi?",
    a: "Sertifikat NextLevel berformat PDF dengan nomor unik (contoh: NLA-20260515-A1B2C3D4) yang dapat diverifikasi di halaman publik /verify/[id]. Cocok untuk dilampirkan ke LinkedIn dan CV.",
  },
  {
    q: "Apa bedanya jalur kursus dan jalur magang?",
    a: "Jalur kursus untuk belajar mandiri dengan gamifikasi. Jalur magang berbasis batch + kelas (maks. 10 peserta), ada absensi harian, tugas mingguan, mentor 1-on-1, dan rekap nilai akhir — tidak ada EXP/level di jalur magang.",
  },
  {
    q: "Bisakah pembelian dibatalkan atau direfund?",
    a: "Mengikuti kebijakan NextLevel, pembelian bersifat final dan tidak dapat di-refund. Order yang belum dibayar dalam 60 menit akan kedaluwarsa otomatis sehingga kamu bebas mencoba ulang.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Saat ini mendukung kartu kredit/debit, VA (BCA/BNI/Mandiri/BRI), QRIS, dan e-wallet (GoPay/OVO/DANA/ShopeePay) melalui DOKU. Semua transaksi diproses dalam Rupiah (IDR).",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative py-20 sm:py-24">
      <SiteContainer>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <div data-reveal data-from="left" className="lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              FAQ
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Pertanyaan yang sering ditanyakan.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Belum menemukan jawaban? Sapa kami di{" "}
              <a
                href="/contact"
                className="font-semibold text-[color:var(--color-brand-700)] hover:underline"
              >
                halaman kontak
              </a>{" "}
              — biasanya kami balas dalam 1 hari kerja.
            </p>
          </div>

          <Accordion className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                data-reveal
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                className="overflow-hidden rounded-2xl border-0 bg-white ring-1 ring-zinc-200 transition has-[[data-panel-open]]:ring-[color:var(--color-brand-300)] has-[[data-panel-open]]:shadow-[0_24px_50px_-30px_rgba(35,65,137,0.35)]"
              >
                <AccordionTrigger
                  className="group items-center gap-4 px-5 py-5 text-left text-base font-bold text-zinc-900 hover:no-underline [&>[data-slot=accordion-trigger-icon]]:hidden"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] transition group-data-[panel-open]:bg-[color:var(--color-brand-500)] group-data-[panel-open]:text-white group-data-[panel-open]:ring-[color:var(--color-brand-500)]">
                    <Plus
                      className="size-4 transition-transform duration-300 group-data-[panel-open]:rotate-45"
                      strokeWidth={2.6}
                    />
                  </span>
                  <span className="flex-1">{f.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-[68px] pr-5 pb-5 text-sm leading-relaxed text-zinc-600">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SiteContainer>
    </section>
  );
}
