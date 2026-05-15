"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  children: ReactNode;
  onAgree: () => void;
};

export function PrivacyPolicyDialog({ children, onAgree }: Props) {
  const [open, setOpen] = useState(false);

  const effectiveDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function handleAgree() {
    onAgree();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-xl">Kebijakan Privasi</DialogTitle>
          <DialogDescription>
            Berlaku efektif sejak {effectiveDate}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed">
          <section>
            <h3 className="mb-1.5 font-semibold">Definisi</h3>
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana NextLevel Academy
              (&ldquo;kami&rdquo;) mengumpulkan, menggunakan, melindungi, dan
              membagikan informasi pribadi pengguna (&ldquo;Anda&rdquo;) yang
              menggunakan platform pembelajaran kami.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Informasi yang Kami Kumpulkan</h3>
            <p>
              Kami mengumpulkan data akun (nama, email, password ter-hash), data
              progres belajar (EXP, level, sertifikat), data transaksi (riwayat
              pesanan dan metode pembayaran), serta data teknis (alamat IP,
              jenis browser, log aktivitas) saat Anda menggunakan platform.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Penggunaan Informasi</h3>
            <p>
              Informasi digunakan untuk menyediakan layanan kursus dan magang,
              menerbitkan sertifikat, memproses pembayaran, mengirim notifikasi
              penting (verifikasi email, reset password, pembaruan kursus),
              serta meningkatkan kualitas platform.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Perlindungan Informasi Pribadi</h3>
            <p>
              Kami menerapkan kontrol keamanan teknis (enkripsi at-rest dan
              in-transit, hashing password, sesi HTTP-only) dan organisatoris
              (akses berbasis peran) untuk melindungi data Anda. Tidak ada
              sistem yang 100% aman, namun kami berkomitmen menanggapi insiden
              dengan cepat dan transparan.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Pembagian Informasi Pribadi</h3>
            <p>
              Kami tidak menjual data Anda. Data hanya dibagikan kepada
              penyedia layanan tepercaya (pemroses pembayaran, layanan email
              transaksional, hosting video) sebatas yang diperlukan untuk
              menjalankan platform, dan kepada otoritas hukum jika diwajibkan
              oleh peraturan yang berlaku di Indonesia.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Hak Pengguna</h3>
            <p>
              Anda berhak mengakses, memperbarui, atau menghapus data pribadi
              Anda; menarik persetujuan; dan meminta salinan data Anda dalam
              format yang dapat dibaca mesin. Permintaan dapat diajukan melalui
              kanal Kontak di bawah.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Penggunaan Cookie</h3>
            <p>
              Kami menggunakan cookie esensial untuk autentikasi sesi
              (HTTP-only, secure) dan cookie analitik untuk memahami penggunaan
              platform secara agregat. Anda dapat mengelola cookie melalui
              pengaturan browser kapan saja.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Perubahan Kebijakan Privasi</h3>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu.
              Perubahan signifikan akan diberitahukan melalui email atau
              pemberitahuan di platform sebelum berlaku. Tanggal &ldquo;berlaku
              efektif&rdquo; akan diperbarui pada setiap revisi.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold">Kontak Kami</h3>
            <p>
              Pertanyaan terkait privasi dapat dikirim ke{" "}
              <a
                href="mailto:privacy@nextlevelacademy.id"
                className="text-[color:var(--color-brand-700)] underline underline-offset-2"
              >
                privacy@nextlevelacademy.id
              </a>
              .
            </p>
          </section>
        </div>

        <DialogFooter className="m-0 rounded-b-xl border-t bg-muted/50 px-6 py-4">
          <Button
            type="button"
            onClick={handleAgree}
            className="bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] h-11 w-full rounded-xl sm:w-auto"
          >
            Saya Setuju dengan Kebijakan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
