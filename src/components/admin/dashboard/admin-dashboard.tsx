"use client";

import {
  Award,
  BookOpenCheck,
  Briefcase,
  ShoppingCart,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { idr } from "@/lib/format";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import type { AdminDashboardData } from "@/lib/admin-dashboard-types";

import { AdminHero } from "./admin-hero";
import { AttentionCard } from "./attention-card";
import { MetricCard, type MetricCardProps } from "./metric-card";
import { MonthlyBarChart } from "./monthly-bar-chart";
import { RecentTransactionsCard } from "./recent-transactions-card";
import { RevenueAreaChart } from "./revenue-area-chart";
import { TopCoursesCard } from "./top-courses-card";

type Props = {
  firstName: string;
  serverNowISO: string;
  data: AdminDashboardData;
};

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: "Sukses",
  PENDING: "Pending",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELED: "Dibatalkan",
};

/**
 * Client composer for the Admin analytics dashboard (PRD §6.11.2 + operational
 * widgets). Renders FRONTEND-ONLY mock data: a command-center hero, six KPI
 * tiles, four trend/ranking charts, and a recent-transactions + attention split.
 */
export function AdminDashboard({ firstName, serverNowISO, data }: Props) {
  const { metrics } = data;

  const cards: MetricCardProps[] = [
    {
      icon: Users,
      label: "Total Pengguna",
      value: metrics.totalUsers.toLocaleString("id-ID"),
      accent:
        "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
      breakdown: metrics.usersByRole,
    },
    {
      icon: BookOpenCheck,
      label: "Kursus Aktif",
      value: metrics.activeCourses.toLocaleString("id-ID"),
      accent:
        "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30",
    },
    {
      icon: Wallet,
      label: "Total Pendapatan",
      value: idr.format(metrics.totalRevenue),
      accent:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    },
    {
      icon: ShoppingCart,
      label: "Total Transaksi",
      value: metrics.totalTransactions.toLocaleString("id-ID"),
      accent:
        "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
      breakdown: metrics.txByStatus.map((s) => ({
        label: STATUS_LABEL[s.status] ?? s.status,
        count: s.count,
      })),
    },
    {
      icon: Award,
      label: "Sertifikat Terbit",
      value: metrics.certificatesIssued.toLocaleString("id-ID"),
      accent:
        "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
    },
    {
      icon: Briefcase,
      label: "Peserta Magang Aktif",
      value: metrics.activeInterns.toLocaleString("id-ID"),
      accent:
        "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
    },
  ];

  return (
    <StudentPageContainer>
      <AdminHero
        firstName={firstName}
        serverNowISO={serverNowISO}
        today={data.today}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueAreaChart data={data.monthlyRevenue} />
        <MonthlyBarChart
          title="Pendaftaran Pengguna Baru"
          subtitle="Per bulan"
          icon={UserPlus}
          data={data.monthlyRegistrations}
          color="#478ef4"
          seriesLabel="Pendaftaran"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyBarChart
          title="Kursus Terjual"
          subtitle="Per bulan"
          icon={ShoppingCart}
          data={data.monthlyCoursesSold}
          color="#10b981"
          seriesLabel="Terjual"
        />
        <TopCoursesCard courses={data.topCourses} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RecentTransactionsCard
          transactions={data.recentTransactions}
          nowISO={serverNowISO}
        />
        <AttentionCard items={data.attention} />
      </div>
    </StudentPageContainer>
  );
}
