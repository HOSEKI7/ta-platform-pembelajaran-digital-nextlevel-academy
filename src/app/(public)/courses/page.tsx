import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { loadCoursesPage } from "@/lib/courses-loader";
import {
  type Sort,
  coursesQueryKey,
  parsePage,
  parseSort,
} from "@/lib/courses-query";
import { prisma } from "@/lib/prisma";
import { getQueryClient } from "@/lib/query-client";

import { CatalogClient } from "@/components/public/landing/catalog-client";
import { CatalogJsonLd } from "@/components/public/landing/catalog-jsonld";
import { FeaturedCoursesSkeleton } from "@/components/public/landing/landing-skeletons";
import { SiteContainer } from "@/components/public/site-container";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevel.academy";

type SP = { page?: string; category?: string; sort?: string };

type Props = { searchParams: Promise<SP> };

function canonicalForCatalog(sp: SP): string {
  const url = new URL("/courses", siteUrl);
  if (sp.category) url.searchParams.set("category", sp.category);
  if (sp.sort && sp.sort !== "latest") url.searchParams.set("sort", sp.sort);
  if (sp.page && sp.page !== "1") url.searchParams.set("page", sp.page);
  return url.pathname + (url.search || "");
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const category = sp.category;
  const page = parsePage(sp.page);

  const titleBase = category ? `Kursus ${category}` : "Semua Kursus";
  const title = page > 1 ? `${titleBase} — Halaman ${page}` : titleBase;

  const description = category
    ? `Eksplor kursus ${category} di NextLevel Academy. Bayar sekali, akses seumur hidup, gamifikasi EXP, dan sertifikat resmi.`
    : "Katalog lengkap kursus NextLevel Academy. Web programming, data science, UI/UX, mobile, marketing — semua dengan akses seumur hidup dan sertifikat resmi.";

  const canonical = canonicalForCatalog(sp);

  return {
    title,
    description,
    keywords: [
      "katalog kursus",
      "kursus online Indonesia",
      ...(category ? [`kursus ${category}`] : []),
      "NextLevel Academy",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonical,
      siteName: "NextLevel Academy",
      title,
      description,
      images: [
        {
          url: "/NextLevel_3D_Logo.webp",
          width: 1200,
          height: 630,
          alt: "Katalog kursus NextLevel Academy",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/NextLevel_3D_Logo.webp"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function CoursesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = {
    page: parsePage(sp.page),
    category: sp.category ?? null,
    sort: parseSort(sp.sort) as Sort,
  };

  return (
    <>
      {/* Hero (SSR, static) */}
      <section className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 85% 0%, rgba(71,142,244,0.18) 0%, transparent 42%)," +
              "linear-gradient(180deg, rgba(238,245,255,0.7) 0%, rgba(255,255,255,1) 65%)",
          }}
        />
        <SiteContainer>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-200)] backdrop-blur">
            <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)]" />
            Katalog kursus
          </span>
          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Pilih kursus,{" "}
            <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
              naik level
            </span>{" "}
            secepat kamu mau.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Bayar sekali, akses seumur hidup. Gunakan filter di bawah untuk
            menemukan kursus yang paling cocok dengan tujuan kamu.
          </p>
        </SiteContainer>
      </section>

      {/* Hydrated client catalog: filters, sort, grid, pagination */}
      <Suspense fallback={<FeaturedCoursesSkeleton />}>
        <CatalogData params={params} />
      </Suspense>
    </>
  );
}

async function CatalogData({
  params,
}: {
  params: { page: number; category: string | null; sort: Sort };
}) {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: coursesQueryKey(params),
      queryFn: () => loadCoursesPage(params),
    }),
    queryClient.prefetchQuery({
      queryKey: ["public", "categories"],
      queryFn: getCategoriesData, // <- ini jawaban Penjelasan #2, lihat di bawah
    }),
  ]);

  const initial = queryClient.getQueryData<
    Awaited<ReturnType<typeof loadCoursesPage>>
  >(coursesQueryKey(params));

  return (
    <>
      <CatalogJsonLd
        siteUrl={siteUrl}
        category={params.category}
        page={params.page}
        courses={initial?.courses ?? []}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CatalogClient />
      </HydrationBoundary>
    </>
  );
}

// Function unstable_cache-nya diletakkan di sini, level module
// (di luar component), supaya wrapper cache-nya dibuat sekali saat module di-load,
// bukan dibuat ulang tiap request.
const getCategoriesData = unstable_cache(
  async () => {
    const [categories, totalPublished] = await Promise.all([
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
    ]);
    return {
      categories: categories
        .filter((c) => c._count.courses > 0)
        .map((c) => ({ name: c.name, courseCount: c._count.courses })),
      totalPublished,
    };
  },
  ["public-categories"],
  { revalidate: 300, tags: ["categories"] },
);