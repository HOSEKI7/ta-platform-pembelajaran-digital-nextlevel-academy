import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders the homepage with correct title and meta", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/NextLevel Academy/i);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle).toContain("NextLevel Academy");

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
  });

  test("hero section: headline, CTA, live stats", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Belajar\./i }),
    ).toBeVisible();

    const mulai = page.getByRole("link", { name: /Mulai Gratis/i }).first();
    await expect(mulai).toBeVisible();
    await expect(mulai).toHaveAttribute("href", "/register");

    // Hero stats resolve from the API
    const heroStats = page.getByTestId("hero-stats");
    await expect(heroStats).toBeVisible({ timeout: 15_000 });
    await expect(heroStats).toContainText(/Course tersedia/i);
    await expect(heroStats).toContainText(/Peserta terdaftar/i);
  });

  test("featured courses section renders cards from DB", async ({ page }) => {
    await page.goto("/");

    const featured = page.getByTestId("featured-courses");
    await expect(featured).toBeVisible({ timeout: 15_000 });

    // At least one course card with a price formatted in IDR
    await expect(featured.getByText(/Rp/).first()).toBeVisible();

    // Section heading
    await expect(
      page.getByRole("heading", { name: /Kursus pilihan/i }),
    ).toBeVisible();
  });

  test("stats strip resolves 4 cells from API", async ({ page }) => {
    await page.goto("/");

    const strip = page.getByTestId("stats-strip");
    await expect(strip).toBeVisible({ timeout: 15_000 });
    await expect(strip).toContainText(/Peserta aktif/i);
    await expect(strip).toContainText(/Kursus dirilis/i);
    await expect(strip).toContainText(/Completion rate/i);
  });

  test("navigation: 'Lihat semua kursus' goes to /courses", async ({ page }) => {
    await page.goto("/");

    const link = page.getByRole("link", { name: /Lihat semua kursus/i }).first();
    await expect(link).toHaveAttribute("href", "/courses");
    await Promise.all([
      page.waitForURL(/\/courses\/?$/, { timeout: 15_000 }),
      link.click(),
    ]);
  });

  test("robots.txt and sitemap.xml are reachable", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsBody = await robots.text();
    expect(robotsBody).toMatch(/User-Agent/i);
    expect(robotsBody).toMatch(/Sitemap:/i);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("<urlset");
  });

  test("public API: stats endpoint returns DB-derived numbers", async ({ request }) => {
    const res = await request.get("/api/public/stats");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data).toBeTruthy();
    expect(typeof json.data.learners).toBe("number");
    expect(typeof json.data.courses).toBe("number");
    expect(typeof json.data.enrollments).toBe("number");
    expect(typeof json.data.completionRate).toBe("number");
  });

  test("public API: featured-courses returns up to 6 courses", async ({ request }) => {
    const res = await request.get("/api/public/featured-courses");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data.courses)).toBe(true);
    expect(json.data.courses.length).toBeLessThanOrEqual(6);
    if (json.data.courses.length > 0) {
      const c = json.data.courses[0];
      expect(c.title).toBeTruthy();
      expect(c.slug).toBeTruthy();
      expect(c.thumbnailUrl).toBeTruthy();
    }
  });
});
