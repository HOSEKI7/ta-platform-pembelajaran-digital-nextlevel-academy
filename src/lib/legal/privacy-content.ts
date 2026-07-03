export type LegalSection = {
  title: string;
  body: string;
};

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "Definisi",
    body: "Kebijakan Privasi ini menjelaskan bagaimana NextLevel Academy (\"kami\") mengumpulkan, menggunakan, melindungi, dan membagikan informasi pribadi pengguna (\"Anda\") yang menggunakan platform pembelajaran kami.",
  },
  {
    title: "Informasi yang Kami Kumpulkan",
    body: "Kami mengumpulkan data akun (nama, email, password ter-hash), data progres belajar (EXP, level, sertifikat), data transaksi (riwayat pesanan dan metode pembayaran), serta data teknis (alamat IP, jenis browser, log aktivitas) saat Anda menggunakan platform.",
  },
  {
    title: "Penggunaan Informasi",
    body: "Informasi digunakan untuk menyediakan layanan kursus dan magang, menerbitkan sertifikat, memproses pembayaran, mengirim notifikasi penting (verifikasi email, reset password, pembaruan kursus), serta meningkatkan kualitas platform.",
  },
  {
    title: "Perlindungan Informasi Pribadi",
    body: "Kami menerapkan kontrol keamanan teknis (enkripsi at-rest dan in-transit, hashing password, sesi HTTP-only) dan organisatoris (akses berbasis peran) untuk melindungi data Anda. Tidak ada sistem yang 100% aman, namun kami berkomitmen menanggapi insiden dengan cepat dan transparan.",
  },
  {
    title: "Pembagian Informasi Pribadi",
    body: "Kami tidak menjual data Anda. Data hanya dibagikan kepada penyedia layanan tepercaya (pemroses pembayaran, layanan email transaksional, hosting video) sebatas yang diperlukan untuk menjalankan platform, dan kepada otoritas hukum jika diwajibkan oleh peraturan yang berlaku di Indonesia.",
  },
  {
    title: "Hak Pengguna",
    body: "Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda; menarik persetujuan; dan meminta salinan data Anda dalam format yang dapat dibaca mesin. Permintaan dapat diajukan melalui kanal Kontak di bawah.",
  },
  {
    title: "Penggunaan Cookie",
    body: "Kami menggunakan cookie esensial untuk autentikasi sesi (HTTP-only, secure) dan cookie analitik untuk memahami penggunaan platform secara agregat. Anda dapat mengelola cookie melalui pengaturan browser kapan saja.",
  },
  {
    title: "Perubahan Kebijakan Privasi",
    body: "Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau pemberitahuan di platform sebelum berlaku. Tanggal \"berlaku efektif\" akan diperbarui pada setiap revisi.",
  },
  {
    title: "Kontak Kami",
    body: 'Pertanyaan terkait privasi dapat dikirim ke <a href="mailto:privacy@nextlevelacademy.id" class="text-[color:var(--color-brand-700)] underline underline-offset-2">privacy@nextlevelacademy.id</a>.',
  },
];
