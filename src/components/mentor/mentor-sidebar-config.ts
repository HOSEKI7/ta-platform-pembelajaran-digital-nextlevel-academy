import {
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type MentorNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

/**
 * Mentor sidebar navigation. Order and labels mirror PRD §5.4. The mentor area
 * is a fully separate app surface gated to MENTOR — it deliberately excludes
 * every Peserta-Didik surface (kursus, sertifikat, EXP & level, transaksi).
 *
 * "Absensi" is the mentor's OWN attendance (daily check-in); "Absensi Peserta"
 * is the read-only class roster monitor. "Nilai Akhir" 404s until built
 * (mirrors how the Peserta-Magang surface grew).
 */
export const MENTOR_NAV_ITEMS: MentorNavItem[] = [
  {
    href: "/mentor/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/mentor/attendance", label: "Absensi", icon: CalendarCheck },
  { href: "/mentor/students", label: "Daftar Peserta", icon: Users },
  { href: "/mentor/student-attendance", label: "Absensi Peserta", icon: UserCheck },
  { href: "/mentor/tasks", label: "Tugas", icon: ClipboardList },
  { href: "/mentor/grades", label: "Nilai Akhir", icon: GraduationCap },
  { href: "/mentor/settings", label: "Pengaturan", icon: Settings },
];
