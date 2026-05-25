/**
 * Placeholder transaction history for the student "Transaksi" page while the
 * frontend is built ahead of the backend. The shape mirrors a future
 * `Order`-join-`Course` DTO (see `prisma/schema.prisma` `model Order`), so
 * swapping this for a real data-loader later touches only the import.
 *
 * `status` matches the Prisma `OrderStatus` enum (PRD §6.4.4). `checkoutAt`
 * is `Order.createdAt` (the moment the order/checkout was created).
 */
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";

export type TransactionRowDTO = {
  /** Order id — shown verbatim as the "ID Transaksi". */
  id: string;
  courseTitle: string;
  /** ISO string — `Order.createdAt`. */
  checkoutAt: string;
  status: TransactionStatus;
  /** Final amount paid/charged in IDR (whole rupiah). */
  finalPrice: number;
};

export const MOCK_TRANSACTIONS: TransactionRowDTO[] = [
  {
    id: "clx9a7k2p0001trx0web0pay1",
    courseTitle: "Fullstack Web Development dengan Next.js 16",
    checkoutAt: "2026-05-24T09:12:00+07:00",
    status: "SUCCESS",
    finalPrice: 479000,
  },
  {
    id: "clx8b3m9q0002trx0uiux0fig2",
    courseTitle: "UI/UX Design Fundamental: Figma sampai Prototype",
    checkoutAt: "2026-05-23T20:45:00+07:00",
    status: "PENDING",
    finalPrice: 299000,
  },
  {
    id: "clx7c1n4r0003trx0data0sci3",
    courseTitle: "Data Science & Analitik dengan Python",
    checkoutAt: "2026-05-22T14:03:00+07:00",
    status: "SUCCESS",
    finalPrice: 525000,
  },
  {
    id: "clx6d8p7s0004trx0devops004",
    courseTitle: "DevOps Esensial: Docker, CI/CD, dan Deployment",
    checkoutAt: "2026-05-20T11:30:00+07:00",
    status: "FAILED",
    finalPrice: 399000,
  },
  {
    id: "clx5e2q1t0005trx0mobile0rn5",
    courseTitle: "Mobile App dengan React Native",
    checkoutAt: "2026-05-19T08:17:00+07:00",
    status: "SUCCESS",
    finalPrice: 349000,
  },
  {
    id: "clx4f6r3u0006trx0digital0m6",
    courseTitle: "Digital Marketing & Strategi Konten",
    checkoutAt: "2026-05-17T16:52:00+07:00",
    status: "EXPIRED",
    finalPrice: 249000,
  },
  {
    id: "clx3g9s5v0007trx0backend0g7",
    courseTitle: "Backend API dengan Node.js dan PostgreSQL",
    checkoutAt: "2026-05-15T19:08:00+07:00",
    status: "SUCCESS",
    finalPrice: 429000,
  },
  {
    id: "clx2h4t8w0008trx0cloud0aws8",
    courseTitle: "Cloud Computing Dasar di AWS",
    checkoutAt: "2026-05-13T10:25:00+07:00",
    status: "SUCCESS",
    finalPrice: 559000,
  },
  {
    id: "clx1i7u2x0009trx0graphic0d9",
    courseTitle: "Desain Grafis untuk Pemula dengan Adobe",
    checkoutAt: "2026-05-11T13:40:00+07:00",
    status: "FAILED",
    finalPrice: 199000,
  },
  {
    id: "clx0j3v6y0010trx0excel0biz0",
    courseTitle: "Microsoft Excel untuk Analisis Bisnis",
    checkoutAt: "2026-05-09T07:55:00+07:00",
    status: "SUCCESS",
    finalPrice: 179000,
  },
  {
    id: "clwzk8w9z0011trx0machine0l1",
    courseTitle: "Pengantar Machine Learning Praktis",
    checkoutAt: "2026-05-06T21:14:00+07:00",
    status: "EXPIRED",
    finalPrice: 615000,
  },
  {
    id: "clwyl1x4a0012trx0cyber0sec2",
    courseTitle: "Keamanan Siber: Fondasi Ethical Hacking",
    checkoutAt: "2026-05-03T15:36:00+07:00",
    status: "SUCCESS",
    finalPrice: 489000,
  },
  {
    id: "clwxm5y7b0013trx0product0m3",
    courseTitle: "Manajemen Produk Digital dari Nol",
    checkoutAt: "2026-04-29T18:02:00+07:00",
    status: "SUCCESS",
    finalPrice: 379000,
  },
];
