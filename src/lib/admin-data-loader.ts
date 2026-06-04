import "server-only";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { CourseStatus, OrderStatus, Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type {
  AdminDashboardData,
  MonthlyPoint,
  OrderStatus as OrderStatusLiteral,
  RoleCount,
  StatusCount,
} from "@/lib/admin-dashboard-types";

const WIB_TZ = "Asia/Jakarta";

/** Indonesian short month labels, indexed 0–11. */
const ID_SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
] as const;

const ROLE_LABEL: Record<Role, string> = {
  [Role.PESERTA_DIDIK]: "Peserta Didik",
  [Role.PESERTA_MAGANG]: "Peserta Magang",
  [Role.MENTOR]: "Mentor",
  [Role.ADMINISTRATOR]: "Administrator",
};

/** Fixed display order for the per-status transaction breakdown. */
const STATUS_ORDER: OrderStatusLiteral[] = [
  "SUCCESS",
  "PENDING",
  "FAILED",
  "EXPIRED",
  "CANCELED",
];

type MonthBucket = { year: number; month: number; key: string; label: string };

/**
 * The trailing 12 WIB months ending at the current WIB month, plus the UTC
 * instant of the first bucket's WIB-midnight (used to bound the SQL scans).
 */
function buildMonthWindow(now: Date): { buckets: MonthBucket[]; startUTC: Date } {
  const [yStr, mStr] = formatInTimeZone(now, WIB_TZ, "yyyy-MM").split("-");
  let year = Number(yStr);
  let month = Number(mStr) - 11; // start 11 months before the current month
  while (month <= 0) {
    month += 12;
    year -= 1;
  }

  const buckets: MonthBucket[] = [];
  for (let i = 0; i < 12; i += 1) {
    buckets.push({
      year,
      month,
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: ID_SHORT_MONTHS[month - 1],
    });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const startUTC = fromZonedTime(`${buckets[0].key}-01 00:00:00`, WIB_TZ);
  return { buckets, startUTC };
}

/** Map raw `{ ym, value }` rows onto the fixed month window (0 for empty months). */
function mapToWindow(
  buckets: MonthBucket[],
  rows: ReadonlyArray<{ ym: string; value: number }>,
): MonthlyPoint[] {
  const byKey = new Map(rows.map((r) => [r.ym, r.value]));
  return buckets.map((b) => ({ month: b.label, value: byKey.get(b.key) ?? 0 }));
}

/**
 * Loads the Admin analytics dashboard (PRD §6.11.2 + operational widgets) from
 * live data. All queries fan out in a single `Promise.all`; monthly buckets use
 * raw SQL with a UTC→WIB cast (DateTime columns are naive `timestamp` storing
 * UTC) so trends align to the platform's hardcoded WIB calendar.
 *
 * Binding decisions: "peserta magang aktif" = PESERTA_MAGANG users with an
 * active account; revenue / courses-sold are keyed on `paidAt` (SUCCESS only).
 */
export async function loadAdminDashboard(): Promise<AdminDashboardData> {
  const now = new Date();
  const { buckets, startUTC } = buildMonthWindow(now);

  // Start of "today" in WIB, expressed as a UTC instant.
  const todayKey = formatInTimeZone(now, WIB_TZ, "yyyy-MM-dd");
  const todayStartUTC = fromZonedTime(`${todayKey} 00:00:00`, WIB_TZ);

  const [
    usersByRoleGroup,
    activeCourses,
    orderStatusGroup,
    certificatesIssued,
    activeInterns,
    todayNewUsers,
    todayTransactions,
    todayRevenueAgg,
    topCoursesGroup,
    recentOrders,
    attentionOrders,
    monthlyOrderRows,
    monthlyUserRows,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { finalPrice: true },
    }),
    prisma.certificate.count(),
    prisma.user.count({
      where: { role: Role.PESERTA_MAGANG, isActive: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: todayStartUTC } } }),
    prisma.order.count({ where: { createdAt: { gte: todayStartUTC } } }),
    prisma.order.aggregate({
      _sum: { finalPrice: true },
      where: { status: OrderStatus.SUCCESS, paidAt: { gte: todayStartUTC } },
    }),
    prisma.order.groupBy({
      by: ["courseId"],
      where: { status: OrderStatus.SUCCESS },
      _count: { _all: true },
      _sum: { finalPrice: true },
      orderBy: { _count: { courseId: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      select: {
        id: true,
        finalPrice: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: OrderStatus.PENDING, expiresAt: { gt: now } },
      orderBy: { expiresAt: "asc" },
      take: 5,
      select: {
        id: true,
        finalPrice: true,
        expiresAt: true,
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.$queryRaw<Array<{ ym: string; revenue: bigint; sold: bigint }>>`
      SELECT to_char(date_trunc('month', ("paidAt" AT TIME ZONE 'UTC' AT TIME ZONE ${WIB_TZ})), 'YYYY-MM') AS ym,
             COALESCE(SUM("finalPrice"), 0)::bigint AS revenue,
             COUNT(*)::bigint AS sold
      FROM "order"
      WHERE "status"::text = 'SUCCESS'
        AND "paidAt" IS NOT NULL
        AND "paidAt" >= ${startUTC}
      GROUP BY ym
    `,
    prisma.$queryRaw<Array<{ ym: string; value: bigint }>>`
      SELECT to_char(date_trunc('month', ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${WIB_TZ})), 'YYYY-MM') AS ym,
             COUNT(*)::bigint AS value
      FROM "user"
      WHERE "createdAt" >= ${startUTC}
      GROUP BY ym
    `,
  ]);

  // ---- Users: total + per-role breakdown (fixed order) ----------------------
  const roleCountMap = new Map<Role, number>(
    usersByRoleGroup.map((r) => [r.role, r._count._all]),
  );
  const usersByRole: RoleCount[] = (Object.keys(ROLE_LABEL) as Role[]).map(
    (role) => ({ label: ROLE_LABEL[role], count: roleCountMap.get(role) ?? 0 }),
  );
  const totalUsers = usersByRole.reduce((sum, r) => sum + r.count, 0);

  // ---- Orders: totals + per-status breakdown --------------------------------
  const statusCountMap = new Map<string, number>(
    orderStatusGroup.map((s) => [s.status, s._count._all]),
  );
  const totalRevenue =
    orderStatusGroup.find((s) => s.status === OrderStatus.SUCCESS)?._sum
      .finalPrice ?? 0;
  const totalTransactions = orderStatusGroup.reduce(
    (sum, s) => sum + s._count._all,
    0,
  );
  const txByStatus: StatusCount[] = STATUS_ORDER.map((status) => ({
    status,
    count: statusCountMap.get(status) ?? 0,
  }));

  // ---- Top courses: resolve titles for the grouped courseIds ----------------
  const topCourseIds = topCoursesGroup.map((g) => g.courseId);
  const courseTitleMap = new Map<string, string>(
    topCourseIds.length > 0
      ? (
          await prisma.course.findMany({
            where: { id: { in: topCourseIds } },
            select: { id: true, title: true },
          })
        ).map((c) => [c.id, c.title])
      : [],
  );
  const topCourses = topCoursesGroup.map((g) => ({
    title: courseTitleMap.get(g.courseId) ?? "(kursus dihapus)",
    sold: g._count._all,
    revenue: g._sum.finalPrice ?? 0,
  }));

  // ---- Recent transactions + attention --------------------------------------
  const recentTransactions = recentOrders.map((o) => ({
    id: o.id,
    user: o.user.name,
    course: o.course.title,
    amount: o.finalPrice,
    status: o.status as OrderStatusLiteral,
    createdAtISO: o.createdAt.toISOString(),
  }));

  const attention = attentionOrders.map((o) => ({
    id: o.id,
    user: o.user.name,
    course: o.course.title,
    amount: o.finalPrice,
    expiresInMin: Math.max(
      0,
      Math.round((o.expiresAt.getTime() - now.getTime()) / 60_000),
    ),
  }));

  return {
    metrics: {
      totalUsers,
      usersByRole,
      activeCourses,
      totalRevenue,
      totalTransactions,
      txByStatus,
      certificatesIssued,
      activeInterns,
    },
    today: {
      revenue: todayRevenueAgg._sum.finalPrice ?? 0,
      transactions: todayTransactions,
      newUsers: todayNewUsers,
    },
    monthlyRevenue: mapToWindow(
      buckets,
      monthlyOrderRows.map((r) => ({ ym: r.ym, value: Number(r.revenue) })),
    ),
    monthlyRegistrations: mapToWindow(
      buckets,
      monthlyUserRows.map((r) => ({ ym: r.ym, value: Number(r.value) })),
    ),
    monthlyCoursesSold: mapToWindow(
      buckets,
      monthlyOrderRows.map((r) => ({ ym: r.ym, value: Number(r.sold) })),
    ),
    topCourses,
    recentTransactions,
    attention,
  };
}
