/**
 * Client-safe types for the Admin analytics dashboard (PRD §6.11.2 + operational
 * widgets). Shared by the server loader (`admin-data-loader.ts`) and the client
 * dashboard components. No `server-only` import here — components import these
 * types directly across the client boundary.
 *
 * `OrderStatus` is a union literal mirroring the Prisma enum so nothing pulls
 * the generated client into a client bundle.
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
