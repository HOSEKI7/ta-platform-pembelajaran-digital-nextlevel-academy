/**
 * Static mock data for the Admin analytics dashboard (PRD §6.11.2 + operational
 * widgets). This is a FRONTEND-ONLY placeholder — there is no Prisma loader yet;
 * the real `admin-data-loader.ts` (live queries) is a deliberate follow-up.
 *
 * Kept as a plain module (NOT `server-only`) because the dashboard charts are
 * client components and import this directly. `OrderStatus` is a client-safe
 * union literal mirroring the Prisma enum so nothing pulls in the generated
 * client on the client boundary.
 */

export type OrderStatus = "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED";

/** A single month bucket for the trend charts (e.g. `{ month: "Jun", value: 12 }`). */
export type MonthlyPoint = {
  /** Short Indonesian month label, e.g. "Jun". */
  month: string;
  value: number;
};

export type RoleCount = {
  /** Human label, e.g. "Peserta Didik". */
  label: string;
  count: number;
};

export type StatusCount = {
  status: OrderStatus;
  count: number;
};

export type TopCourse = {
  title: string;
  sold: number;
  revenue: number;
};

export type RecentTransaction = {
  id: string;
  user: string;
  course: string;
  amount: number;
  status: OrderStatus;
  createdAtISO: string;
};

export type AttentionItem = {
  id: string;
  user: string;
  course: string;
  amount: number;
  /** Minutes left before the PENDING order auto-expires (PRD §6.4 — 60 min). */
  expiresInMin: number;
};

export type AdminDashboardData = {
  metrics: {
    totalUsers: number;
    usersByRole: RoleCount[];
    activeCourses: number;
    totalRevenue: number;
    totalTransactions: number;
    txByStatus: StatusCount[];
    certificatesIssued: number;
    activeInterns: number;
  };
  /** "Hari ini" snapshot shown in the hero panel. */
  today: {
    revenue: number;
    transactions: number;
    newUsers: number;
  };
  monthlyRevenue: MonthlyPoint[];
  monthlyRegistrations: MonthlyPoint[];
  monthlyCoursesSold: MonthlyPoint[];
  topCourses: TopCourse[];
  recentTransactions: RecentTransaction[];
  attention: AttentionItem[];
};

// Trailing-12-months labels ending at the current month (WIB-agnostic — labels
// only). Static so the chart axis reads naturally.
const MONTHS = [
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
] as const;

const monthly = (values: readonly number[]): MonthlyPoint[] =>
  MONTHS.map((month, i) => ({ month, value: values[i] ?? 0 }));

// Relative timestamps for the recent-transactions feed, anchored to a fixed
// reference so SSR/CSR render identically (no `Date.now()` drift) AND the
// "x mnt lalu" labels stay meaningful regardless of the real clock. The feed
// is rendered relative to this same anchor.
export const MOCK_NOW_ISO = "2026-05-30T10:30:00.000Z";
const minutesAgo = (m: number) =>
  new Date(new Date(MOCK_NOW_ISO).getTime() - m * 60_000).toISOString();

export const ADMIN_DASHBOARD_MOCK: AdminDashboardData = {
  metrics: {
    totalUsers: 1284,
    usersByRole: [
      { label: "Peserta Didik", count: 1187 },
      { label: "Peserta Magang", count: 78 },
      { label: "Mentor", count: 16 },
      { label: "Administrator", count: 3 },
    ],
    activeCourses: 24,
    totalRevenue: 487_650_000,
    totalTransactions: 1642,
    txByStatus: [
      { status: "SUCCESS", count: 1389 },
      { status: "PENDING", count: 47 },
      { status: "FAILED", count: 121 },
      { status: "EXPIRED", count: 85 },
    ],
    certificatesIssued: 936,
    activeInterns: 64,
  },
  today: {
    revenue: 4_785_000,
    transactions: 17,
    newUsers: 23,
  },
  monthlyRevenue: monthly([
    22_400_000, 26_900_000, 24_100_000, 31_500_000, 29_800_000, 35_200_000,
    41_600_000, 38_900_000, 44_300_000, 47_100_000, 52_800_000, 49_650_000,
  ]),
  monthlyRegistrations: monthly([
    58, 64, 71, 69, 83, 92, 110, 97, 121, 134, 142, 128,
  ]),
  monthlyCoursesSold: monthly([
    74, 81, 88, 79, 96, 108, 132, 119, 147, 158, 172, 161,
  ]),
  topCourses: [
    { title: "Fullstack Web Development", sold: 412, revenue: 123_188_000 },
    { title: "UI/UX Design Fundamental", sold: 318, revenue: 79_182_000 },
    { title: "Data Science dengan Python", sold: 276, revenue: 96_324_000 },
    { title: "Digital Marketing Mastery", sold: 241, revenue: 47_959_000 },
    { title: "DevOps & Cloud Engineering", sold: 198, revenue: 78_804_000 },
  ],
  recentTransactions: [
    {
      id: "ORD-8F2A91",
      user: "Naya Putri Anggraini",
      course: "Fullstack Web Development",
      amount: 299_000,
      status: "SUCCESS",
      createdAtISO: minutesAgo(4),
    },
    {
      id: "ORD-7C1B30",
      user: "Bagas Pratama",
      course: "Data Science dengan Python",
      amount: 349_000,
      status: "SUCCESS",
      createdAtISO: minutesAgo(18),
    },
    {
      id: "ORD-6E9D74",
      user: "Salsabila Rahmadani",
      course: "UI/UX Design Fundamental",
      amount: 249_000,
      status: "PENDING",
      createdAtISO: minutesAgo(33),
    },
    {
      id: "ORD-5A4F22",
      user: "Rizky Maulana",
      course: "Digital Marketing Mastery",
      amount: 199_000,
      status: "FAILED",
      createdAtISO: minutesAgo(57),
    },
    {
      id: "ORD-4B8C09",
      user: "Dewi Lestari",
      course: "DevOps & Cloud Engineering",
      amount: 398_000,
      status: "SUCCESS",
      createdAtISO: minutesAgo(82),
    },
    {
      id: "ORD-3D7E15",
      user: "Fajar Nugroho",
      course: "Fullstack Web Development",
      amount: 299_000,
      status: "EXPIRED",
      createdAtISO: minutesAgo(126),
    },
    {
      id: "ORD-2F6A88",
      user: "Intan Permatasari",
      course: "Data Science dengan Python",
      amount: 349_000,
      status: "SUCCESS",
      createdAtISO: minutesAgo(171),
    },
  ],
  attention: [
    {
      id: "ORD-6E9D74",
      user: "Salsabila Rahmadani",
      course: "UI/UX Design Fundamental",
      amount: 249_000,
      expiresInMin: 12,
    },
    {
      id: "ORD-9A3C57",
      user: "Yoga Saputra",
      course: "DevOps & Cloud Engineering",
      amount: 398_000,
      expiresInMin: 27,
    },
    {
      id: "ORD-1B2D40",
      user: "Citra Ayu Wulandari",
      course: "Fullstack Web Development",
      amount: 299_000,
      expiresInMin: 44,
    },
  ],
};
