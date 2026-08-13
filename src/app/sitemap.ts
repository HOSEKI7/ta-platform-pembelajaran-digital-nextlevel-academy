import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelacademy.id";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/legal/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/legal/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...courseEntries];
  } catch (err) {
    console.error("[sitemap] failed to load courses:", err);
    return staticEntries;
  }
}
