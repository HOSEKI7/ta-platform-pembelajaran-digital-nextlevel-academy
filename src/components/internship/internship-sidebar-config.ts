import {
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type InternshipNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

/**
 * Peserta-Magang sidebar navigation. Order and labels mirror PRD §6.5.2.
 * Deliberately excludes every Peserta-Didik surface (kursus, sertifikat,
 * EXP & level, transaksi) — the internship area is a fully separate app
 * surface gated to PESERTA_MAGANG.
 */
export const INTERNSHIP_NAV_ITEMS: InternshipNavItem[] = [
  {
    href: "/internship/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/internship/attendance", label: "Absensi", icon: CalendarCheck },
  { href: "/internship/tasks", label: "Tugas", icon: ClipboardList },
  { href: "/internship/final-grade", label: "Nilai Akhir", icon: GraduationCap },
  { href: "/internship/settings", label: "Pengaturan", icon: Settings },
];
