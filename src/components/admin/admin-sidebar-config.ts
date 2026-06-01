import {
  Award,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  Library,
  Medal,
  Receipt,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** A single navigable destination (top-level or nested under a group). */
export type AdminNavLeaf = {
  kind: "leaf";
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

/** A collapsible group that holds child destinations (a dropdown). */
export type AdminNavGroup = {
  kind: "group";
  label: string;
  icon: LucideIcon;
  children: Omit<AdminNavLeaf, "kind">[];
};

export type AdminNavEntry = AdminNavLeaf | AdminNavGroup;

/**
 * Admin sidebar navigation. Order and labels mirror PRD §5.3. The admin area is
 * a fully separate app surface gated to ADMINISTRATOR — it deliberately excludes
 * every other role's surface.
 *
 * Top-level items render as flat links; groups render as collapsible dropdowns
 * (accordion — one open at a time, auto-opened on the active route). Some child
 * routes (Kategori Course, the Program Magang modules, Pengaturan) 404 until
 * their pages exist — this mirrors how the other role surfaces grew incrementally.
 */
export const ADMIN_NAV_ITEMS: AdminNavEntry[] = [
  { kind: "leaf", href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    kind: "group",
    label: "Course",
    icon: BookOpen,
    children: [
      { href: "/admin/courses", label: "Daftar Course", icon: Library },
      { href: "/admin/courses/categories", label: "Kategori Course", icon: FolderTree },
    ],
  },
  { kind: "leaf", href: "/admin/users", label: "Pengguna", icon: Users },
  { kind: "leaf", href: "/admin/certificates", label: "Sertifikat", icon: Award },
  {
    kind: "group",
    label: "Keuangan",
    icon: Wallet,
    children: [
      { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
      { href: "/admin/vouchers", label: "Voucher", icon: Ticket },
    ],
  },
  {
    kind: "group",
    label: "Gamifikasi",
    icon: Trophy,
    children: [
      { href: "/admin/gamification/exp-rules", label: "Aturan EXP", icon: Sparkles },
      { href: "/admin/gamification/badges", label: "Badge", icon: Medal },
    ],
  },
  {
    kind: "group",
    label: "Program Magang",
    icon: Briefcase,
    children: [
      { href: "/admin/internship/mentor-attendance", label: "Absensi Mentor", icon: CalendarCheck },
      { href: "/admin/internship/student-attendance", label: "Absensi Peserta", icon: ClipboardCheck },
      { href: "/admin/internship/tasks", label: "Tugas", icon: ClipboardList },
      { href: "/admin/internship/grades", label: "Nilai Akhir", icon: GraduationCap },
      { href: "/admin/internship/config", label: "Konfigurasi Magang", icon: SlidersHorizontal },
      { href: "/admin/internship/work-config", label: "Konfigurasi Jam Kerja dan Libur", icon: CalendarClock },
    ],
  },
  { kind: "leaf", href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

/** Whether `href` matches the current pathname (prefix match unless `exact`). */
export function isHrefActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Among a group's children, the href of the *best* (longest) match — so sibling
 * routes that share a prefix (e.g. `/admin/courses` vs `/admin/courses/categories`)
 * highlight only the most specific one. Returns null when no child matches.
 */
export function activeChildHref(pathname: string, group: AdminNavGroup): string | null {
  let best: string | null = null;
  for (const child of group.children) {
    if (isHrefActive(pathname, child.href) && (!best || child.href.length > best.length)) {
      best = child.href;
    }
  }
  return best;
}

/** Label of the group containing the active route, or null (used to auto-open). */
export function findActiveGroupLabel(pathname: string): string | null {
  for (const entry of ADMIN_NAV_ITEMS) {
    if (entry.kind === "group" && activeChildHref(pathname, entry)) return entry.label;
  }
  return null;
}
