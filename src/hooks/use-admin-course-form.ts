"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCourseKeys } from "@/lib/admin-course-query-keys";
import type { CourseGeneralInput, CourseStatusValue } from "@/lib/validations/admin-course";

export type CourseFormPayload = {
  values: CourseGeneralInput;
  thumbnailFile: File | null;
  instructorFile: File | null;
};

function buildFormData(p: CourseFormPayload): FormData {
  const v = p.values;
  const fd = new FormData();
  fd.append("title", v.title);
  fd.append("slug", v.slug);
  fd.append("shortDescription", v.shortDescription ?? "");
  fd.append("description", v.description);
  fd.append("categoryId", v.categoryId);
  fd.append("price", String(v.price));
  if (v.fakePrice != null) fd.append("fakePrice", String(v.fakePrice));
  fd.append("instructor", v.instructor);
  fd.append("instructorBio", v.instructorBio);
  fd.append("isFeatured", v.isFeatured ? "true" : "false");
  fd.append("status", v.status);
  fd.append("benefits", JSON.stringify(v.benefits ?? []));
  fd.append("faqs", JSON.stringify(v.faqs ?? []));
  if (p.thumbnailFile) fd.append("thumbnail", p.thumbnailFile);
  if (p.instructorFile) fd.append("instructorImg", p.instructorFile);
  return fd;
}

async function send(url: string, method: "POST" | "PATCH", p: CourseFormPayload): Promise<{ id: string }> {
  const res = await fetch(url, { method, body: buildFormData(p) });
  const body = (await res.json().catch(() => null)) as
    | { data?: { id: string }; error?: string }
    | null;
  if (!res.ok || !body?.data) {
    throw new Error(body?.error ?? `Gagal menyimpan kursus (${res.status}).`);
  }
  return body.data;
}

/** Create a course as DRAFT (multipart). Returns the new course id. */
export function useCreateCourseMutation() {
  return useMutation({
    mutationFn: (p: CourseFormPayload) => send("/api/admin/courses", "POST", p),
  });
}

/** Update an existing course's general info + settings (multipart). */
export function useUpdateCourseMutation(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CourseFormPayload) => send(`/api/admin/courses/${courseId}`, "PATCH", p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCourseKeys.detail(courseId) });
    },
  });
}

/** Change a course's status (Publish/Draft/Archive) — runs §6.11.3 validation. */
export function useUpdateCourseStatusMutation(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: CourseStatusValue): Promise<{ status: CourseStatusValue }> => {
      const res = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await res.json().catch(() => null)) as
        | { data?: { status: CourseStatusValue }; error?: string }
        | null;
      if (!res.ok || !body?.data) {
        throw new Error(body?.error ?? `Gagal mengubah status (${res.status}).`);
      }
      return body.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCourseKeys.detail(courseId) });
    },
  });
}
