import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.REVALIDATION_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // ponytail: warm DB pool before ISR regen to avoid cold-start timeout
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return Response.json({ error: "db not ready" }, { status: 503 });
  }

  await Promise.all([
    revalidatePath("/"),
    revalidatePath("/about"),
    revalidatePath("/contact"),
  ]);

  return Response.json({ revalidated: true });
}
