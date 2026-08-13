import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Course OpenGraph Image";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      instructor: true,
      price: true,
      category: { select: { name: true } },
    },
  });

  // Load fonts
  const fontDir = join(process.cwd(), "src/lib/certificates/fonts");
  const [poppinsRegular, poppinsBold] = await Promise.all([
    readFile(join(fontDir, "Poppins-Regular.ttf")),
    readFile(join(fontDir, "Poppins-Bold.ttf")),
  ]);

  const title = course?.title ?? "Kursus NextLevel Academy";
  const category = course?.category?.name ?? "Kursus Online";
  const instructor = course?.instructor ?? "NextLevel Academy";
  const price = course?.price
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(course.price)
    : "Gratis";

  const svg = await satori(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        fontFamily: "Poppins",
        position: "relative",
      }}
    >
      {/* Gradient accent */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          right: 0,
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(71,142,244,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          flex: "1",
          maxWidth: "720px",
        }}
      >
        {/* Category pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#EBF3FE",
              color: "#2B5BB5",
              fontSize: "14px",
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: "20px",
            }}
          >
            {category}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "42px",
            fontWeight: 700,
            color: "#1A1A2E",
            lineHeight: 1.15,
            marginBottom: "20px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Instructor */}
        <div
          style={{
            fontSize: "18px",
            color: "#71717a",
            marginBottom: "8px",
            display: "flex",
          }}
        >
          oleh {instructor}
        </div>

        {/* Price */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#478EF4",
            display: "flex",
          }}
        >
          {price}
        </div>
      </div>

      {/* Right brand block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "420px",
          backgroundColor: "#478EF4",
          borderRadius: "0 0 0 60px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "white",
            display: "flex",
          }}
        >
          NLA
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.85)",
            marginTop: "8px",
            display: "flex",
          }}
        >
          NextLevel Academy
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "60px",
          fontSize: "14px",
          color: "#a1a1aa",
          display: "flex",
        }}
      >
        nextlevelacademy.id
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Poppins",
          data: poppinsRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Poppins",
          data: poppinsBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
