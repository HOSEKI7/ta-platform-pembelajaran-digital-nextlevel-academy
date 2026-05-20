import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
