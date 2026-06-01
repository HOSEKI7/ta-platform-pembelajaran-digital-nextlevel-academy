/**
 * One-off data normalization for internship Batch / Bidang / Kelas names.
 *
 * Legacy seed data stored redundant batch prefixes inside Field/Class names
 * (e.g. Field "Batch 1 - Web Programming", Class "Batch 1 - Web Programming - A"),
 * which leaked into admin tables. This migration makes the stored names match
 * the convention the create logic already follows:
 *
 *   - Field.name  -> bare name             ("Web Programming")
 *   - Class.name  -> "<Batch> - <Bidang> - <Letter>"  ("Batch 1 2026 - Web Programming - A")
 *
 * It is idempotent (re-running on clean data is a no-op) and tolerant of either
 * legacy prefix shape ("Batch 1 - …" or "Batch 1 2026 - …"). A leading segment
 * is only stripped when it looks like a batch prefix (starts with "Batch "),
 * so a legitimately bare field name is never mangled.
 *
 * When two fields in the same batch collapse to the same bare name (e.g. both
 * seed scripts ran and created "Batch 1 - Web Programming" + "Batch 1 2026 -
 * Web Programming"), the EMPTY duplicate (no interns / mentors / tasks on it or
 * its classes) is removed so the survivor can take the @@unique slot. If more
 * than one duplicate is actually in use, it aborts for manual resolution.
 *
 * Run:
 *   npx tsx scripts/normalize-internship-names.ts            # apply
 *   npx tsx scripts/normalize-internship-names.ts --dry-run  # preview only
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

const DRY_RUN = process.argv.includes("--dry-run");

/** Strip a leading "Batch … - " prefix from a field name; otherwise keep it. */
function bareFieldName(name: string): string {
  const segs = name.split(" - ");
  if (segs.length >= 2 && /^batch\b/i.test(segs[0].trim())) {
    return segs.slice(1).join(" - ").trim();
  }
  return name.trim();
}

/** Trailing segment (the letter) of a composite class name. */
function classLetter(name: string): string {
  return name.split(" - ").pop()?.trim() || name.trim();
}

/** Total usage on a field = its own tasks + interns/mentors/tasks on its classes. */
async function resolveDuplicateFields() {
  const fields = await db.field.findMany({
    select: {
      id: true,
      name: true,
      batchId: true,
      _count: { select: { tasks: true } },
      classes: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { internshipProfiles: true, mentorProfiles: true, tasks: true },
          },
        },
      },
    },
  });

  const usageOfField = (f: (typeof fields)[number]) =>
    f._count.tasks +
    f.classes.reduce(
      (s, c) =>
        s + c._count.internshipProfiles + c._count.mentorProfiles + c._count.tasks,
      0,
    );

  // Group by (batchId, bareName).
  const groups = new Map<string, typeof fields>();
  for (const f of fields) {
    const key = `${f.batchId}::${bareFieldName(f.name)}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(f);
  }

  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const bare = key.split("::").slice(1).join("::");
    const used = group.filter((f) => usageOfField(f) > 0);
    if (used.length > 1) {
      console.error(
        `ABORT: ${used.length} fields normalize to "${bare}" in the same batch and more than one is in use (${used
          .map((f) => `${f.id}="${f.name}"`)
          .join(", ")}). Merge manually first.`,
      );
      process.exit(1);
    }
    const keeper = used[0] ?? group[0];
    const drop = group.filter((f) => f.id !== keeper.id);
    console.log(
      `Duplicate "${bare}": keep ${keeper.id} ("${keeper.name}"), removing ${drop.length} empty duplicate(s).`,
    );
    if (DRY_RUN) continue;
    for (const f of drop) {
      await db.$transaction(async (tx) => {
        for (const c of f.classes) {
          await tx.class.delete({ where: { id: c.id } });
        }
        await tx.field.delete({ where: { id: f.id } });
      });
      console.log(`  removed field ${f.id} ("${f.name}") + ${f.classes.length} class(es).`);
    }
  }
}

async function main() {
  console.log(`\n== Normalize internship names ${DRY_RUN ? "(DRY RUN)" : ""} ==\n`);

  // 0) Collapse empty duplicate fields that would collide on the bare name.
  await resolveDuplicateFields();

  const fields = await db.field.findMany({
    select: { id: true, name: true, batchId: true, batch: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const fieldRenames = fields
    .map((f) => ({ id: f.id, batchName: f.batch.name, from: f.name, to: bareFieldName(f.name) }))
    .filter((r) => r.from !== r.to);

  console.log(`Fields: ${fields.length} total, ${fieldRenames.length} need renaming`);
  for (const r of fieldRenames) console.log(`  "${r.from}"  ->  "${r.to}"`);

  // Rebuild every class composite from live batch + (normalized) field + letter.
  const classes = await db.class.findMany({
    select: {
      id: true,
      name: true,
      field: { select: { id: true, name: true, batch: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  });

  const classRenames = classes
    .map((c) => {
      const batchName = c.field.batch.name;
      const fieldName = bareFieldName(c.field.name);
      const to = `${batchName} - ${fieldName} - ${classLetter(c.name)}`;
      return { id: c.id, from: c.name, to };
    })
    .filter((r) => r.from !== r.to);

  console.log(`\nClasses: ${classes.length} total, ${classRenames.length} need renaming`);
  for (const r of classRenames) console.log(`  "${r.from}"  ->  "${r.to}"`);

  if (DRY_RUN) {
    console.log(`\nDry run — no changes written.`);
    return;
  }
  if (fieldRenames.length === 0 && classRenames.length === 0) {
    console.log(`\nNothing to do — names already normalized.`);
    return;
  }

  await db.$transaction(async (tx) => {
    // Classes first (they reference the field name we're about to change, but we
    // compute the target from the bare name independently, so order is safe).
    for (const r of classRenames) {
      await tx.class.update({ where: { id: r.id }, data: { name: r.to } });
    }
    for (const r of fieldRenames) {
      await tx.field.update({ where: { id: r.id }, data: { name: r.to } });
    }
  });

  console.log(`\nDone — ${fieldRenames.length} field(s) and ${classRenames.length} class(es) updated.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
