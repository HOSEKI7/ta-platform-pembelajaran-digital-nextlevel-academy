import { Role } from "@/generated/prisma";

export type NavLinkDef = {
  href: string;
  label: string;
  exact?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

export const PUBLIC_NAV_LINKS: NavLinkDef[] = [
  { href: "/", label: "Beranda", exact: true },
  { href: "/about", label: "Tentang Kami" },
  { href: "/courses", label: "Kursus" },
  { href: "/blog", label: "Blog", disabled: true, comingSoon: true },
  { href: "/contact", label: "Kontak" },
];

export function dashboardHrefFor(role: Role): string {
  switch (role) {
    case Role.PESERTA_MAGANG:
      return "/internship/dashboard";
    case Role.MENTOR:
      return "/mentor/dashboard";
    case Role.ADMINISTRATOR:
      return "/admin/dashboard";
    case Role.PESERTA_DIDIK:
    default:
      return "/dashboard";
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case Role.PESERTA_DIDIK:
      return "Peserta Didik";
    case Role.PESERTA_MAGANG:
      return "Peserta Magang";
    case Role.MENTOR:
      return "Mentor";
    case Role.ADMINISTRATOR:
      return "Administrator";
  }
}
