import { z } from "zod";

export const CERTIFICATES_PAGE_SIZES = [10, 25, 50] as const;
export const CERTIFICATES_SORT_VALUES = ["asc", "desc"] as const;

export type CertificatesPageSize = (typeof CERTIFICATES_PAGE_SIZES)[number];
export type CertificatesSort = (typeof CERTIFICATES_SORT_VALUES)[number];

export const claimCertificateSchema = z.object({
  courseId: z.string().min(1, "courseId wajib diisi."),
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
