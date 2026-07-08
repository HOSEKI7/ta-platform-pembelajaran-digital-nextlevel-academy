/**
 * Fetch an internal Next.js API route from a Server Component.
 *
 * Uses `NEXT_PUBLIC_APP_URL` for the base URL — no `headers()` call, so
 * components using this stay eligible for static generation / ISR (unless
 * the parent layout uses dynamic APIs). Default revalidate matches the
 * route handlers' own `export const revalidate = 60`.
 */
export async function publicApi<T>(
  path: string,
  init?: { revalidate?: number; tags?: string[] },
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://nextlevelacademy.id");

  const res = await fetch(`${baseUrl}${path}`, {
    next: { revalidate: init?.revalidate ?? 60, tags: init?.tags },
  });

  if (!res.ok) {
    throw new Error(`publicApi(${path}) ${res.status}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}
