/**
 * Client-safe mock data + helpers for the Peserta-Magang Tugas surface
 * (`/internship/tasks` and `/internship/tasks/[taskId]`). This is a UI-only
 * design pass — it mirrors how the Absensi surface began life as mock data
 * before being wired to Prisma. No `server-only` here: both the route's server
 * components and the client views import these.
 *
 * Aligns with PRD §6.9.3: submission states are NOT_SUBMITTED / SUBMITTED, and
 * a "returned" task is NOT_SUBMITTED + mentor feedback. The display layer adds
 * TERLEWAT (past deadline & never submitted) for the history view.
 */

/** UI-resolved status shown on badges. Derived via {@link resolveStatus}. */
export type TaskDisplayStatus = "BELUM" | "TERKUMPUL" | "DIKEMBALIKAN" | "TERLEWAT";

/** Stored submission state on the mock task (before deadline-derivation). */
export type TaskBaseStatus = "BELUM" | "TERKUMPUL" | "DIKEMBALIKAN";

export type AttachmentKind = "pdf" | "docx" | "zip" | "image";

export type TaskAttachment = {
  name: string;
  /** Pre-formatted human size, e.g. "1,2 MB". */
  sizeLabel: string;
  kind: AttachmentKind;
};

export type MentorFeedback = {
  mentorName: string;
  /** ISO timestamp the mentor returned the task. */
  returnedAtISO: string;
  text: string;
};

export type SubmittedFile = {
  name: string;
  sizeLabel: string;
  submittedAtISO: string;
};

export type MagangTask = {
  id: string;
  title: string;
  /** Mentor who authored the task. */
  mentorName: string;
  /** ISO deadline (WIB instants stored as UTC ISO). */
  deadlineISO: string;
  /** Multi-paragraph instructions; paragraphs split on blank lines. */
  description: string;
  /** Optional acceptance criteria checklist. */
  requirements?: string[];
  /** Optional file attached by the mentor. */
  attachment?: TaskAttachment;
  /** Stored submission state (pre-deadline derivation). */
  status: TaskBaseStatus;
  /** Present only when the task was returned for revision. */
  feedback?: MentorFeedback;
  /** Present when the task has been submitted. */
  submittedFile?: SubmittedFile;
};

// ---- Status metadata --------------------------------------------------------

export type StatusMeta = {
  label: string;
  /** Pill container classes (light + dark). */
  pill: string;
  /** Leading dot color. */
  dot: string;
};

export const STATUS_META: Record<TaskDisplayStatus, StatusMeta> = {
  TERKUMPUL: {
    label: "Terkumpul",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  DIKEMBALIKAN: {
    label: "Dikembalikan",
    pill: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
    dot: "bg-amber-500",
  },
  BELUM: {
    label: "Belum Dikumpulkan",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
    dot: "bg-zinc-400",
  },
  TERLEWAT: {
    label: "Tidak Dikumpulkan",
    pill: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
};

// ---- Urgency ----------------------------------------------------------------

export type UrgencyTone = "danger" | "warning" | "muted";

export type Urgency = { text: string; tone: UrgencyTone; overdue: boolean };

/**
 * Relative deadline label. Mirrors the dashboard `pending-tasks-card` thresholds
 * (<24h danger · ≤2d warning · else muted) and adds an overdue branch for the
 * history view.
 */
export function urgencyFor(deadlineISO: string, now: Date): Urgency {
  const hours = (new Date(deadlineISO).getTime() - now.getTime()) / 3_600_000;
  if (hours < 0) {
    const days = Math.ceil(-hours / 24);
    return {
      text: days <= 1 ? "Lewat hari ini" : `Lewat ${days} hari lalu`,
      tone: "muted",
      overdue: true,
    };
  }
  if (hours < 24) {
    return { text: `${Math.max(1, Math.round(hours))} jam lagi`, tone: "danger", overdue: false };
  }
  const days = Math.ceil(hours / 24);
  return { text: `${days} hari lagi`, tone: days <= 2 ? "warning" : "muted", overdue: false };
}

/** Effective display status: TERKUMPUL stays; otherwise overdue → TERLEWAT. */
export function resolveStatus(task: MagangTask, now: Date): TaskDisplayStatus {
  if (task.status === "TERKUMPUL") return "TERKUMPUL";
  const overdue = new Date(task.deadlineISO).getTime() < now.getTime();
  if (overdue) return "TERLEWAT";
  return task.status; // BELUM | DIKEMBALIKAN
}

/** Whether the submission window is still open (deadline not yet passed). */
export function isSubmittable(task: MagangTask, now: Date): boolean {
  return new Date(task.deadlineISO).getTime() >= now.getTime();
}

// ---- Collection helpers -----------------------------------------------------

export function getTaskById(id: string): MagangTask | undefined {
  return MOCK_TASKS.find((t) => t.id === id);
}

/** Split into Akan Datang (deadline ≥ now) / Telah Lewat (deadline < now). */
export function splitByDeadline(
  tasks: MagangTask[],
  now: Date,
): { upcoming: MagangTask[]; past: MagangTask[] } {
  const upcoming: MagangTask[] = [];
  const past: MagangTask[] = [];
  for (const t of tasks) {
    if (new Date(t.deadlineISO).getTime() >= now.getTime()) upcoming.push(t);
    else past.push(t);
  }
  // Upcoming: soonest deadline first. Past: most recent first.
  upcoming.sort((a, b) => +new Date(a.deadlineISO) - +new Date(b.deadlineISO));
  past.sort((a, b) => +new Date(b.deadlineISO) - +new Date(a.deadlineISO));
  return { upcoming, past };
}

/** Human file size from raw bytes (used by the live dropzone for real Files). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

// ---- Mock dataset -----------------------------------------------------------

const MENTOR = "Rangga Wibisana";

/**
 * Dummy tasks for the Web Programming class. Dates sit inside Batch 1 2026
 * (14/04 – 04/07/2026); "today" in the demo is late May 2026, so the set spans
 * upcoming and past deadlines and covers every display state.
 */
export const MOCK_TASKS: MagangTask[] = [
  {
    id: "t-jwt-auth",
    title: "Membangun REST API Autentikasi dengan JWT",
    mentorName: MENTOR,
    deadlineISO: "2026-06-02T16:59:00.000Z", // 02/06/2026 23:59 WIB
    description:
      "Bangun endpoint autentikasi untuk aplikasi magang menggunakan Node.js dan Express.\n\nGunakan JSON Web Token (JWT) untuk sesi, simpan password dengan hashing bcrypt, dan terapkan middleware proteksi route. Sertakan dokumentasi singkat (README) cara menjalankannya secara lokal.",
    requirements: [
      "Endpoint POST /register dan POST /login berfungsi",
      "Password di-hash, tidak disimpan plain-text",
      "Middleware memverifikasi JWT pada route terproteksi",
      "Sertakan koleksi Postman atau contoh request",
    ],
    attachment: { name: "Panduan-REST-API-Auth.pdf", sizeLabel: "1,4 MB", kind: "pdf" },
    status: "BELUM",
  },
  {
    id: "t-dashboard-responsif",
    title: "Implementasi Halaman Dashboard Responsif",
    mentorName: MENTOR,
    deadlineISO: "2026-05-29T10:00:00.000Z", // 29/05/2026 17:00 WIB — < 24 jam
    description:
      "Implementasikan ulang halaman dashboard dari desain Figma yang sudah dibagikan.\n\nPerhatikan kerapian breakpoint mobile-first (sm → md → lg) dan konsistensi spacing. Tugas sebelumnya dikembalikan — silakan perbaiki sesuai catatan mentor lalu kumpulkan ulang sebelum tenggat.",
    requirements: [
      "Layout sesuai desain pada viewport mobile, tablet, dan desktop",
      "Tidak ada horizontal scroll di layar kecil",
      "Komponen kartu memakai grid yang konsisten",
    ],
    attachment: { name: "Desain-Dashboard.zip", sizeLabel: "3,8 MB", kind: "zip" },
    status: "DIKEMBALIKAN",
    feedback: {
      mentorName: MENTOR,
      returnedAtISO: "2026-05-26T04:12:00.000Z", // 26/05/2026 11:12 WIB
      text: "Kerja bagus untuk versi desktop. Namun pada viewport mobile (≤ 640px) kartu statistik masih menimbulkan horizontal scroll dan padding antar-section terlalu rapat. Tolong perbaiki grid menjadi 1 kolom di mobile dan samakan jarak vertikal antar-kartu, lalu kumpulkan ulang ya. Sisanya sudah oke!",
    },
  },
  {
    id: "t-atomic-design",
    title: "Refactor Komponen ke Pola Atomic Design",
    mentorName: MENTOR,
    deadlineISO: "2026-06-10T16:59:00.000Z", // 10/06/2026 23:59 WIB
    description:
      "Rapikan struktur komponen frontend mengikuti pola Atomic Design (atoms, molecules, organisms).\n\nFokus pada reusability dan penamaan yang konsisten. Tidak perlu mengubah tampilan akhir — cukup struktur dan organisasi kode.",
    requirements: [
      "Komponen dikelompokkan: atoms / molecules / organisms",
      "Tidak ada duplikasi komponen tombol/input",
      "Penamaan file konsisten (kebab-case)",
    ],
    status: "TERKUMPUL",
    submittedFile: {
      name: "refactor-atomic-design.zip",
      sizeLabel: "2,1 MB",
      submittedAtISO: "2026-05-27T08:40:00.000Z",
    },
  },
  {
    id: "t-midtrans",
    title: "Integrasi Pembayaran Midtrans (Sandbox)",
    mentorName: MENTOR,
    deadlineISO: "2026-06-20T16:59:00.000Z", // 20/06/2026 23:59 WIB
    description:
      "Integrasikan gateway pembayaran Midtrans pada mode sandbox.\n\nGunakan Snap untuk menampilkan popup pembayaran, lalu tangani status transaksi melalui webhook. Pastikan alur idempoten — satu transaksi sukses tidak boleh diproses dua kali.",
    requirements: [
      "Popup Snap muncul dan transaksi sandbox berhasil",
      "Webhook memvalidasi signature",
      "Status order tersimpan dengan benar",
    ],
    attachment: { name: "Spesifikasi-Pembayaran.docx", sizeLabel: "612 KB", kind: "docx" },
    status: "BELUM",
  },
  {
    id: "t-setup-proyek",
    title: "Setup Proyek & Konfigurasi ESLint + Prettier",
    mentorName: MENTOR,
    deadlineISO: "2026-05-05T16:59:00.000Z", // 05/05/2026 — lewat, terkumpul tepat waktu
    description:
      "Inisialisasi repository proyek magang, konfigurasikan ESLint dan Prettier, serta siapkan struktur folder dasar.\n\nPastikan perintah lint dan format berjalan tanpa error.",
    requirements: [
      "Repository terinisialisasi dengan README",
      "ESLint + Prettier terkonfigurasi dan tidak konflik",
      "Script npm run lint berjalan bersih",
    ],
    status: "TERKUMPUL",
    submittedFile: {
      name: "setup-proyek-magang.zip",
      sizeLabel: "880 KB",
      submittedAtISO: "2026-05-04T09:15:00.000Z",
    },
  },
  {
    id: "t-optimasi-query",
    title: "Studi Kasus: Optimasi Query Database",
    mentorName: MENTOR,
    deadlineISO: "2026-05-12T16:59:00.000Z", // 12/05/2026 — lewat & tidak dikumpulkan
    description:
      "Analisis sebuah query lambat yang diberikan, lalu tulis laporan berisi penyebab dan strategi optimasi (indexing, denormalisasi, atau perbaikan query).\n\nSertakan perbandingan waktu eksekusi sebelum dan sesudah optimasi.",
    requirements: [
      "Identifikasi bottleneck dengan EXPLAIN ANALYZE",
      "Usulan indeks yang relevan",
      "Bukti perbandingan waktu eksekusi",
    ],
    attachment: { name: "Dataset-Studi-Kasus.zip", sizeLabel: "4,6 MB", kind: "zip" },
    status: "BELUM", // → TERLEWAT (overdue)
  },
  {
    id: "t-wireframe",
    title: "Membuat Wireframe Fitur Magang",
    mentorName: MENTOR,
    deadlineISO: "2026-05-20T16:59:00.000Z", // 20/05/2026 — lewat, terkumpul
    description:
      "Susun wireframe low-fidelity untuk fitur absensi dan tugas pada aplikasi magang.\n\nGunakan Figma atau alat sejenis, ekspor menjadi PDF, dan jelaskan alur antar-layar secara singkat.",
    requirements: [
      "Wireframe mencakup alur absensi dan tugas",
      "Anotasi alur antar-layar tersedia",
      "Diekspor sebagai satu berkas PDF",
    ],
    status: "TERKUMPUL",
    submittedFile: {
      name: "wireframe-fitur-magang.pdf",
      sizeLabel: "1,9 MB",
      submittedAtISO: "2026-05-19T13:05:00.000Z",
    },
  },
];
