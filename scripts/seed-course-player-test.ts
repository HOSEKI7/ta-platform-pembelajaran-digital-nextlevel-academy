/**
 * Seed a single test course for the Course Player backend integration.
 * Idempotent: re-run after editing the BUNNY_VIDEOS list — the script wipes
 * the course's existing sprints/steps and re-creates them.
 *
 * Prerequisites:
 *   1. The target user (default: faridzahran174@gmail.com) is already
 *      registered through /sign-up.
 *   2. The main seed (`npm run db:seed`) has been run at least once so a
 *      Category row exists.
 *   3. You've uploaded videos to your Bunny Stream library and copied each
 *      video's GUID into the BUNNY_VIDEOS array below.
 *
 * Run with:  npm run db:seed:player
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma";

// -----------------------------------------------------------------------------
// CONFIG — edit these before running
// -----------------------------------------------------------------------------

const TARGET_EMAIL = "faridzahran174@gmail.com";
const COURSE_SLUG = "belajar-rest-api-modern-dengan-nextjs";

/**
 * Each entry becomes one Sprint+Step+Video row group. After uploading
 * videos to Bunny Stream:
 *   1. Open each video in the Bunny dashboard
 *   2. Copy the GUID from the URL (format: `xxxxxxxx-xxxx-xxxx-...`)
 *   3. Paste it into the `guid` field below
 *   4. Update `durationSec` to match the actual video length (Bunny shows it)
 *
 * The default placeholder GUIDs ("PASTE_GUID_*") work for DB seeding but
 * the iframe will fail to load until you replace them with real values.
 */
const BUNNY_VIDEOS = [
  {
    sprintTitle: "Fondasi",
    sprintOrder: 1,
    stepTitle: "Pendahuluan & Tujuan Course",
    stepOrder: 1,
    durationSec: 60,
    guid: "a010a741-2680-412b-94ee-ce48afa4d9df",
  },
  {
    sprintTitle: "Fondasi",
    sprintOrder: 1,
    stepTitle: "Setup Project dengan Next.js 16",
    stepOrder: 2,
    durationSec: 60,
    guid: "4beacc23-5153-4677-96e8-a4ba053e3d04",
  },
  {
    sprintTitle: "Routing & Handler",
    sprintOrder: 2,
    stepTitle: "Route Handlers Dasar",
    stepOrder: 1,
    durationSec: 60,
    guid: "4f3e52d8-3306-493b-a14f-b960dc3bcb1e",
  },
  {
    sprintTitle: "Routing & Handler",
    sprintOrder: 2,
    stepTitle: "Dynamic Routes & Nested Segments",
    stepOrder: 2,
    durationSec: 60,
    guid: "29c0f2dd-010c-48de-9a23-4d43124a35c1",
  },
];

// -----------------------------------------------------------------------------

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  console.log(`\n== Course Player test seed ==`);

  // 1. Verify target user exists
  const user = await db.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true, name: true },
  });
  if (!user) {
    throw new Error(
      `User ${TARGET_EMAIL} not found. Register via /sign-up first, then re-run.`,
    );
  }
  console.log(`  user:      ${user.name} (${TARGET_EMAIL})`);

  // 2. Verify a category exists (we use the first one as a fallback)
  const category = await db.category.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!category) {
    throw new Error(
      "No Category found. Run `npm run db:seed` first to seed the main catalog.",
    );
  }
  console.log(`  category:  ${category.name}`);

  // 3. Upsert the test course
  const course = await db.course.upsert({
    where: { slug: COURSE_SLUG },
    create: {
      slug: COURSE_SLUG,
      categoryId: category.id,
      title: "Belajar REST API Modern dengan Next.js",
      shortDescription:
        "Bangun REST API production-grade pakai Next.js App Router, dari nol sampai deploy.",
      description:
        "Kursus praktis untuk yang ingin memahami pondasi REST API modern: Route Handlers, dynamic routes, validasi Zod, autentikasi, dan deploy ke Vercel.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop",
      price: 299000,
      fakePrice: 599000,
      estimatedDuration: 8,
      instructor: "Aulia Pratama",
      instructorBio:
        "Senior Engineer dengan pengalaman membangun sistem berskala besar di Tokopedia dan Gojek. Fokus pada DX, performa, dan arsitektur API yang gampang dirawat oleh tim.",
      instructorImg:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop",
      status: "PUBLISHED",
      isFeatured: true,
    },
    update: { status: "PUBLISHED" },
    select: { id: true, slug: true },
  });
  console.log(`  course:    ${course.slug} (${course.id})`);

  // 4. Wipe existing sprints (cascade deletes steps + videos) — keeps script idempotent
  const wiped = await db.sprint.deleteMany({ where: { courseId: course.id } });
  if (wiped.count > 0) {
    console.log(`  cleared:   ${wiped.count} existing sprint(s)`);
  }

  // 5. Group videos by sprint title, then create sprint -> step -> video
  const bySprint = new Map<string, typeof BUNNY_VIDEOS>();
  for (const v of BUNNY_VIDEOS) {
    const arr = bySprint.get(v.sprintTitle) ?? [];
    arr.push(v);
    bySprint.set(v.sprintTitle, arr);
  }

  for (const [sprintTitle, videos] of bySprint) {
    const sprint = await db.sprint.create({
      data: {
        courseId: course.id,
        title: sprintTitle,
        order: videos[0].sprintOrder,
      },
      select: { id: true },
    });

    for (const v of videos) {
      await db.step.create({
        data: {
          sprintId: sprint.id,
          title: v.stepTitle,
          type: "VIDEO",
          order: v.stepOrder,
          description: `Materi pembelajaran: ${v.stepTitle}. Tonton sampai habis untuk mendapatkan +15 XP, atau klik "Tandai Selesai" setelah memahami isinya.`,
          video: {
            create: { bunnyVideoId: v.guid, duration: v.durationSec },
          },
        },
      });
    }
    console.log(`  sprint:    ${sprintTitle} (${videos.length} step)`);
  }

  // 6. Enroll the target user
  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id },
    update: {},
    select: { id: true, progressPct: true },
  });
  console.log(
    `  enroll:    ${enrollment.id} (progress ${enrollment.progressPct}%)`,
  );

  // 7. Warn if any GUIDs still need filling in
  const placeholders = BUNNY_VIDEOS.filter((v) =>
    v.guid.startsWith("PASTE_GUID"),
  );
  if (placeholders.length > 0) {
    console.warn(
      `\n  WARNING: ${placeholders.length} video GUID(s) still placeholder:`,
    );
    for (const p of placeholders) {
      console.warn(`    - ${p.stepTitle}`);
    }
    console.warn(
      `  Player will load but iframe will show an error until you upload videos to Bunny and paste the real GUIDs above.`,
    );
  }

  console.log(`\n  Done. Open: http://localhost:3000/learn/${COURSE_SLUG}\n`);
}

main()
  .catch((err) => {
    console.error("\n[seed-course-player-test] Failed:");
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
