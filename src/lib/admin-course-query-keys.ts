/**
 * Query keys for the admin course create/edit surfaces. The list table uses its
 * own keys in `use-admin-courses`; these cover a single course's curriculum.
 */
export const adminCourseKeys = {
  all: ["admin-course"] as const,
  detail: (courseId: string) => ["admin-course", courseId] as const,
  curriculum: (courseId: string) => ["admin-course", courseId, "curriculum"] as const,
};
