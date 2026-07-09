/** TanStack Query key factory for the Peserta-Magang surface. */
export const internshipKeys = {
  all: ["internship"] as const,
  attendanceMonth: (year: number, month: number) =>
    [...internshipKeys.all, "attendance", year, month] as const,
  /** ponytail: function avoids circular ref (computed inline would TDZ). */
  attendancePrefix: () => [...internshipKeys.all, "attendance"] as const,
  /** Peserta-Magang notification feed (topbar bell). */
  notifications: () => [...internshipKeys.all, "notifications"] as const,
};
