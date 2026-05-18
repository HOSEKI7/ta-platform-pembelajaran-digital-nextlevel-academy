import { headers } from "next/headers";

/**
 * Fetch an internal Next.js API route from a Server Component.
 *
 * Server fetches require an absolute URL; we read host + protocol from the
 * incoming request so this works in dev (http://localhost) and prod (https)
 * without environment-dependent base URLs. Default revalidate matches the
 * route handlers' own `export const revalidate = 60`.
 */
export async function publicApi<T>(
  path: string,
  init?: { revalidate?: number; tags?: string[] },
): Promise<T> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protoHeader = h.get("x-forwarded-proto");
  const protocol = protoHeader ?? (host.startsWith("localhost") ? "http" : "https");

  const res = await fetch(`${protocol}://${host}${path}`, {
    next: { revalidate: init?.revalidate ?? 60, tags: init?.tags },
  });

  if (!res.ok) {
    throw new Error(`publicApi(${path}) ${res.status}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}
