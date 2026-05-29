/** TanStack Query key factory for all mentor-scoped client queries. */
export const mentorKeys = {
  all: ["mentor"] as const,
  /** Mentor's OWN attendance calendar grid for a month (`/mentor/attendance`). */
  selfAttendanceMonth: (year: number, month: number) =>
    [...mentorKeys.all, "self-attendance", year, month] as const,
  /** Class roster attendance for a selected date (`/mentor/student-attendance`). */
  studentAttendanceByDate: (dateISO: string) =>
    [...mentorKeys.all, "student-attendance", dateISO] as const,
  /** Class final grades (`/mentor/grades`). */
  grades: () => [...mentorKeys.all, "grades"] as const,
};
