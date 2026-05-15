/**
 * Remove smoke-test users created during manual testing.
 * Run with:  npx tsx scripts/cleanup-test-users.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  const r = await db.user.deleteMany({
    where: { email: { startsWith: "smoke-test-" } },
  });
  console.log(`Deleted ${r.count} smoke-test users.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
