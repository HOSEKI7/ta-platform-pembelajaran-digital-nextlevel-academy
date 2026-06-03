import { z } from "zod";

export const CERTIFICATES_PAGE_SIZES = [10, 25, 50] as const;
export const CERTIFICATES_SORT_VALUES = ["asc", "desc"] as const;

export type CertificatesPageSize = (typeof CERTIFICATES_PAGE_SIZES)[number];
export type CertificatesSort = (typeof CERTIFICATES_SORT_VALUES)[number];

/**
 * Recipient name printed on the certificate. Restricted to Latin letters +
 * common accents (matches the bundled Poppins glyph coverage — see the Satori
 * renderer) plus spaces and a few name punctuation marks, so it can't carry
 * digits, emoji, or symbols that would break rendering. Shared client+server.
 */
export const recipientNameSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter.")
  .max(80, "Nama maksimal 80 karakter.")
  .regex(
    /^[A-Za-zÀ-ÿ .,'-]+$/,
    "Nama hanya boleh huruf, spasi, titik, koma, tanda kutip, dan tanda hubung.",
  );

export const claimCertificateSchema = z.object({
  courseId: z.string().min(1, "courseId wajib diisi."),
  recipientName: recipientNameSchema,
});

export type ClaimCertificateInput = z.infer<typeof claimCertificateSchema>;

export const certificatesQuerySchema = z.object({
  sort: z.enum(CERTIFICATES_SORT_VALUES).default("desc"),
  pageSize: z.coerce
    .number()
    .int()
    .refine(
      (n): n is CertificatesPageSize =>
        (CERTIFICATES_PAGE_SIZES as readonly number[]).includes(n),
      { message: "pageSize tidak valid." },
    )
    .default(10),
  page: z.coerce.number().int().min(1, "Halaman minimal 1.").default(1),
});

export type CertificatesQuery = z.infer<typeof certificatesQuerySchema>;
