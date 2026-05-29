import {
  Award,
  BookOpen,
  Briefcase,
  LayoutDashboard,
  Receipt,
  Settings,
  Ticket,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

/**
 * Admin sidebar navigation. Order and labels mirror PRD §5.3. The admin area is
 * a fully separate app surface gated to ADMINISTRATOR — it deliberately excludes
 * every other role's surface.
 *
 * Only "Dashboard" is built today; the remaining items 404 until their pages
 * exist (mirrors how the Mentor / Peserta-Magang surfaces grew incrementally).
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Kursus", icon: BookOpen },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
  { href: "/admin/vouchers", label: "Voucher", icon: Ticket },
  { href: "/admin/certificates", label: "Sertifikat", icon: Award },
  { href: "/admin/gamification", label: "Gamifikasi", icon: Trophy },
  { href: "/admin/internship", label: "Magang", icon: Briefcase },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];
