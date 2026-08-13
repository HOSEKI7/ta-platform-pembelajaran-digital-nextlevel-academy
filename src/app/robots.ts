import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelacademy.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/mentor",
          "/internship",
          "/my-courses",
          "/transactions",
          "/learn/",
          "/checkout/",
          "/ganti-password",
          "/undang-admin",
          "/cert/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
