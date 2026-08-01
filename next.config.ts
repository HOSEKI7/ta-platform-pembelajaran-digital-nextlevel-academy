import type { NextConfig } from "next";

const bunnyStorageHost = process.env.BUNNY_STORAGE_PULL_ZONE;
if (!bunnyStorageHost) {
  throw new Error(
    "BUNNY_STORAGE_PULL_ZONE env var is required at build time (next.config.ts)",
  );
}

const nextConfig: NextConfig = {
  // Production deploys build a self-contained server bundle in CI and ship it
  // to the VPS (docs/deployment/05-cicd-github-actions.md). Gated behind an env
  // flag so local `next dev` / `next start` behave exactly as before.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "recharts",
      "date-fns",
    ],
  },
  // Sharp ships a native binary — keep it external so the bundler doesn't try
  // to trace/inline it. Required for the server-side certificate PNG renderer.
  // ioredis is a Node-only client (net sockets) used by the rate limiter; keep
  // it external so Turbopack doesn't try to bundle it.
  serverExternalPackages: ["sharp", "ioredis"],
  // The certificate renderer reads bundled Poppins TTFs from disk via `fs`.
  // A dynamic `fs.readFile` path isn't auto-traced, so include the font files
  // explicitly for every route that may render a certificate.
  outputFileTracingIncludes: {
    "/**": ["./src/lib/certificates/fonts/**"],
  },
  images: {
    // Next.js 16 default = 14400s (4 jam). Di-set eksplisit agar terdokumentasi.
    minimumCacheTTL: 14400,
    remotePatterns: [
      // Seed-data placeholders for course thumbnails, instructor headshots,
      // and badge logos. Safe to remove once real assets land in Supabase
      // Storage and the seed file is updated.
      { protocol: "https", hostname: "placehold.co" },
      // Bunny.net CDN pull zones (storage / cert / stream). Admin-uploaded
      // course thumbnails are signed Pull-Zone URLs (e.g. internship-files.b-cdn.net)
      // resolved via `resolveCourseImageUrl`; next/image must allowlist the host.
      {
        protocol: "https",
        hostname: bunnyStorageHost,
        pathname: "/**",
      },
      // tambahkan entry lain HANYA kalau pull zone itu juga dipakai via <Image src=...>
    ],
  },
};

export default nextConfig;
