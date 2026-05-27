/** TanStack Query key factory for the Peserta-Magang surface. */
export const internshipKeys = {
  all: ["internship"] as const,
  attendanceMonth: (year: number, month: number) =>
    [...internshipKeys.all, "attendance", year, month] as const,
};
