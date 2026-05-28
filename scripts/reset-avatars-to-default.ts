/**
 * One-time migration: retire custom-uploaded avatars.
 *
 * The avatar feature switched from file uploads (Supabase Storage) to a fixed
 * set of preset avatars served from `public/avatars/`. This script:
 *   1. Finds every user whose `image` is NOT a registered preset path.
 *   2. Deletes the old object from Supabase Storage (reclaims free-plan quota)
 *      when the image is a Supabase public URL.
 *   3. Sets `user.image = null` so the user falls back to initials.
 *
 * Idempotent — preset paths (`/avatars/...`) and already-null images are
 * skipped, so re-running is safe.
 *
 * Run with:  npx tsx scripts/reset-avatars-to-default.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma";
import { isValidAvatarPath } from "../src/lib/avatars";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

const BUCKET = process.env.SUPABASE_AVATAR_BUCKET ?? "avatars";

function supabaseObjectPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;

  if (!supabase) {
    console.warn(
      "[reset-avatars] Supabase env not set — will null images without deleting storage objects.",
    );
  }

  const users = await db.user.findMany({
    where: { image: { not: null } },
    select: { id: true, email: true, image: true },
  });

  let reset = 0;
  let deleted = 0;
  let skipped = 0;

  for (const u of users) {
    const image = u.image!;
    // Already on a valid preset — nothing to do (idempotent).
    if (isValidAvatarPath(image)) {
      skipped++;
      continue;
    }

    const objectPath = supabaseObjectPath(image);
    if (objectPath && supabase) {
      const { error } = await supabase.storage.from(BUCKET).remove([objectPath]);
      if (error) {
        console.warn(`[reset-avatars] failed to delete ${objectPath}:`, error.message);
      } else {
        deleted++;
      }
    }

    await db.user.update({ where: { id: u.id }, data: { image: null } });
    reset++;
    console.log(`  reset ${u.email}`);
  }

  console.log(
    `\n[reset-avatars] done — reset ${reset} user(s), deleted ${deleted} storage object(s), skipped ${skipped} preset(s).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
