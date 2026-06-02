import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sharp ships a native binary — keep it external so the bundler doesn't try
  // to trace/inline it. Required for the server-side certificate PNG renderer.
  serverExternalPackages: ["sharp"],
  // The certificate renderer reads bundled Poppins TTFs from disk via `fs`.
  // A dynamic `fs.readFile` path isn't auto-traced, so include the font files
  // explicitly for every route that may render a certificate.
  outputFileTracingIncludes: {
    "/**": ["./src/lib/certificates/fonts/**"],
  },
  images: {
    remotePatterns: [
      // Seed-data placeholders for course thumbnails, instructor headshots,
      // and badge logos. Safe to remove once real assets land in Supabase
      // Storage and the seed file is updated.
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
