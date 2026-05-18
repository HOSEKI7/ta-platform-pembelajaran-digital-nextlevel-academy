import {
  Award,
  BookOpen,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

/**
 * Peserta-Didik sidebar navigation. Order and labels mirror PRD §6.5.1.
 * Catalog (`/courses`) is intentionally not in the sidebar — it's reached
 * via the dashboard's recommendations strip and from public surfaces.
 */
export const STUDENT_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/my-courses", label: "Kursus Saya", icon: BookOpen },
  { href: "/certificates", label: "Sertifikat", icon: Award },
  { href: "/exp-level", label: "EXP & Level", icon: Sparkles },
  { href: "/transactions", label: "Transaksi", icon: Receipt },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];
