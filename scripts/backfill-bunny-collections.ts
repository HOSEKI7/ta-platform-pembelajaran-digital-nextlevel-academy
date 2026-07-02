/**
 * One-off backfill: create a Bunny Stream collection for every course that has
 * videos but no collection yet, and move existing videos into it.
 *
 * Idempotent — skips courses that already have `bunnyCollectionId`.
 * Safe to re-run; per-course failures are logged and don't halt processing.
 *
 * Run with:  npx tsx scripts/backfill-bunny-collections.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const LIB_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const API_KEY = process.env.BUNNY_STREAM_API_KEY ?? "";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function createCollection(name: string): Promise<string> {
  const res = await fetch(`https://video.bunnycdn.com/library/${LIB_ID}/collections`, {
    method: "POST",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name: name.slice(0, 100) }),
  });
  if (!res.ok) throw new Error(`createCollection ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { guid?: string };
  if (!json.guid) throw new Error("respons tanpa GUID");
  return json.guid;
}

async function setVideoCollection(videoGuid: string, collectionId: string): Promise<void> {
  const res = await fetch(`https://video.bunnycdn.com/library/${LIB_ID}/videos/${videoGuid}`, {
    method: "POST",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ collectionId }),
  });
  if (!res.ok) throw new Error(`setVideoCollection ${res.status} ${res.statusText}`);
}

async function main() {
  if (!LIB_ID || !API_KEY) {
    throw new Error("Bunny Stream belum dikonfigurasi (BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY).");
  }

  const courses = await db.course.findMany({
    where: {
      bunnyCollectionId: null,
      sprints: { some: { steps: { some: { video: { isNot: null } } } } },
    },
    select: { id: true, title: true },
  });

  console.log(`Ditemukan ${courses.length} kursus tanpa koleksi (dengan video).`);

  let created = 0;
  let failed = 0;

  for (const course of courses) {
    try {
      const guid = await createCollection(course.title);
      await db.course.update({
        where: { id: course.id },
        data: { bunnyCollectionId: guid },
      });

      const videos = await db.video.findMany({
        where: { step: { sprint: { courseId: course.id } } },
        select: { bunnyVideoId: true },
      });

      let moved = 0;
      for (const v of videos) {
        try {
          await setVideoCollection(v.bunnyVideoId, guid);
          moved++;
        } catch (ve) {
          console.warn(`  ✗ video ${v.bunnyVideoId}:`, ve instanceof Error ? ve.message : ve);
        }
      }

      created++;
      console.log(`✓ "${course.title}" — koleksi ${guid}, ${moved}/${videos.length} video dipindahkan`);
    } catch (err) {
      failed++;
      console.warn(`✗ "${course.title}" gagal:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`Selesai. Dibuat: ${created}, gagal: ${failed}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
