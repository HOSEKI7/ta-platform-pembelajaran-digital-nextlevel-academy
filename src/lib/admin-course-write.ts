import "server-only";

import {
  TASK_IMAGE_ALLOWED_TYPES,
  TASK_IMAGE_MAX_BYTES,
  uploadCourseAsset,
} from "@/lib/bunny-storage";
import {
  courseCreateSchema,
  courseEditSchema,
  type CourseGeneralInput,
  type CourseCreateInput,
} from "@/lib/validations/admin-course";

/**
 * Helpers shared by the create (POST /api/admin/courses) and update
 * (PATCH /api/admin/courses/[id]) routes — both consume the same multipart
 * shape (general text fields as form entries + benefits/faqs as JSON strings +
 * optional thumbnail / instructor image files).
 */

const IMAGE_ALLOWED = TASK_IMAGE_ALLOWED_TYPES as readonly string[];

/**
 * Duck-typed Prisma unique-constraint check. Per the repo gotcha, `instanceof
 * Prisma.PrismaClientKnownRequestError` is unreliable across bundle copies in
 * the Turbopack runtime — match the stable error code instead.
 */
export function isUniqueError(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === "P2002";
}

type ParseResult<T = CourseGeneralInput> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function parseJsonArray(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || value.trim().length === 0) return [];
  try {
    return JSON.parse(value);
  } catch {
    return undefined; // signals malformed → schema will reject
  }
}

function toInt(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim() === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function parseFormBody(form: FormData) {
  const fakeRaw = form.get("fakePrice");
  return {
    title: str(form.get("title")),
    slug: str(form.get("slug")),
    shortDescription: str(form.get("shortDescription")),
    description: str(form.get("description")),
    categoryId: str(form.get("categoryId")),
    price: toInt(form.get("price")),
    fakePrice:
      typeof fakeRaw === "string" && fakeRaw.trim() !== "" ? toInt(fakeRaw) : null,
    instructor: str(form.get("instructor")),
    instructorBio: str(form.get("instructorBio")),
    isFeatured: form.get("isFeatured") === "true",
    status: str(form.get("status")) || "DRAFT",
    benefits: parseJsonArray(form.get("benefits")),
    faqs: parseJsonArray(form.get("faqs")),
  };
}

/** Validate create body (no slug — auto-generated server-side). */
export function parseCourseCreateForm(form: FormData): ParseResult<CourseCreateInput> {
  const parsed = courseCreateSchema.safeParse(parseFormBody(form));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  return { ok: true, data: parsed.data };
}

/** Validate edit body (slug required — admin sets it manually). */
export function parseCourseEditForm(form: FormData): ParseResult<CourseGeneralInput> {
  const parsed = courseEditSchema.safeParse(parseFormBody(form));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  return { ok: true, data: parsed.data };
}

type ImageResult =
  | { ok: true; path: string | null }
  | { ok: false; error: string; status: number };

/**
 * Validate + upload one optional image field. Returns `path: null` when the
 * field is absent (draft without a thumbnail is allowed). Image type/size mirror
 * the rich-text image limits (PNG/JPG/WEBP/GIF ≤ 5 MB).
 */
export async function uploadCourseImageField(opts: {
  form: FormData;
  field: string;
  kind: "thumbnail" | "instructor";
  adminId: string;
}): Promise<ImageResult> {
  const raw = opts.form.get(opts.field);
  if (!(raw instanceof File) || raw.size === 0) {
    return { ok: true, path: null };
  }
  if (!IMAGE_ALLOWED.includes(raw.type)) {
    return {
      ok: false,
      status: 400,
      error: "Format gambar tidak didukung. Gunakan PNG, JPG, WEBP, atau GIF.",
    };
  }
  if (raw.size > TASK_IMAGE_MAX_BYTES) {
    return { ok: false, status: 413, error: "Ukuran gambar melebihi batas 5 MB." };
  }
  try {
    const { objectPath } = await uploadCourseAsset({
      adminId: opts.adminId,
      kind: opts.kind,
      file: raw,
    });
    return { ok: true, path: objectPath };
  } catch (err) {
    console.error("[admin-course-write] image upload failed", err);
    const msg =
      err instanceof Error && err.message.includes("belum dikonfigurasi")
        ? "Penyimpanan file belum dikonfigurasi di server."
        : "Gagal mengunggah gambar ke penyimpanan.";
    return { ok: false, status: 502, error: msg };
  }
}
