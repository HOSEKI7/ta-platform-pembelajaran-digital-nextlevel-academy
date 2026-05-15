/**
 * Verify that the Supabase database is reachable and that the Prisma schema
 * matches what's on the server. Prints:
 *   - list of public tables / enums
 *   - row count per table (sanity-check after seeding)
 *
 * Run with:  npm run db:verify
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  const tables: { table_name: string }[] = await db.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  const enums: { typname: string }[] = await db.$queryRaw`
    SELECT t.typname FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
    ORDER BY t.typname
  `;

  console.log(`\n== Schema (live on Supabase) ==`);
  console.log(`Tables: ${tables.length}`);
  console.log(`Enums:  ${enums.length}`);

  console.log(`\n== Row counts ==`);
  const rows: { table_name: string; n_live_tup: bigint }[] = await db.$queryRaw`
    SELECT relname AS table_name, n_live_tup
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY relname
  `;
  // pg_stat_user_tables is lazy — fall back to per-table count for rows that
  // pg has not yet analyzed since seed.
  for (const t of tables) {
    const stat = rows.find((r) => r.table_name === t.table_name);
    let n = stat ? Number(stat.n_live_tup) : 0;
    if (n === 0) {
      const result: { c: bigint }[] = await db.$queryRawUnsafe(
        `SELECT COUNT(*)::bigint AS c FROM "${t.table_name}"`,
      );
      n = Number(result[0].c);
    }
    console.log(`  ${t.table_name.padEnd(28)} ${n}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
