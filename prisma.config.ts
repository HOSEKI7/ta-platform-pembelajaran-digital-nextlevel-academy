import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then fall back to .env.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL for DDL/migrations (session-mode connection on Supabase
    // free plan via pooler:5432). Fall back to DATABASE_URL for setups that
    // only define one connection string.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
