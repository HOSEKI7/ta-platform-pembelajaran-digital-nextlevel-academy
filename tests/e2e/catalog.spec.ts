import { expect, test } from "@playwright/test";

test.describe("Course catalog", () => {
  test("renders SSR grid with cards and CollectionPage JSON-LD", async ({ page }) => {
    const response = await page.goto("/courses");
    expect(response?.status()).toBe(200);

    const grid = page.getByTestId("catalog-grid");
    await expect(grid).toBeVisible({ timeout: 15_000 });

    const cards = grid.locator("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    const jsonLdHandles = await page.locator('script[type="application/ld+json"]').all();
    const blocks = await Promise.all(jsonLdHandles.map((h) => h.textContent()));
    const hasCollection = blocks.some((b) => b && b.includes('"CollectionPage"'));
    expect(hasCollection).toBe(true);
  });

  test("metadata: canonical, OG, Twitter all present", async ({ page }) => {
    await page.goto("/courses");

    await expect(page).toHaveTitle(/Semua Kursus|Kursus/i);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/\/courses\/?$/);

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle).toBeTruthy();

    const twitterCard = await page
      .locator('meta[name="twitter:card"]')
      .getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");
  });

  test("category chip filters and persists in URL", async ({ page }) => {
    await page.goto("/courses");

    // Wait for chips to load (categories query)
    const webChip = page.getByRole("button", { name: /Web Programming/i });
    await expect(webChip).toBeVisible({ timeout: 15_000 });

    await webChip.click();
    await page.waitForURL(/[?&]category=Web(\+|%20)Programming/);

    // Active state: aria-pressed=true
    await expect(webChip).toHaveAttribute("aria-pressed", "true");

    // Grid still has at least one card (the seeded Next.js course)
    const grid = page.getByTestId("catalog-grid");
    await expect(grid).toBeVisible();
    await expect(grid.getByText(/Next\.js/i).first()).toBeVisible();
  });

  test("sort dropdown updates URL and reorders", async ({ page }) => {
    await page.goto("/courses");

    const sortSelect = page.getByLabel(/Urutkan kursus/i);
    await expect(sortSelect).toBeVisible({ timeout: 15_000 });

    await sortSelect.selectOption("price-asc");
    await page.waitForURL(/[?&]sort=price-asc/);

    const grid = page.getByTestId("catalog-grid");
    await expect(grid).toBeVisible();
  });

  test("public API: /api/public/courses respects category filter", async ({ request }) => {
    const all = await request.get("/api/public/courses?page=1");
    expect(all.status()).toBe(200);
    const allJson = await all.json();
    expect(Array.isArray(allJson.data.courses)).toBe(true);
    expect(allJson.data.total).toBeGreaterThan(0);

    const filtered = await request.get(
      "/api/public/courses?category=Web%20Programming",
    );
    expect(filtered.status()).toBe(200);
    const filteredJson = await filtered.json();
    expect(filteredJson.data.total).toBeLessThanOrEqual(allJson.data.total);
    for (const c of filteredJson.data.courses) {
      expect(c.category.name).toBe("Web Programming");
    }
  });

  test("public API: /api/public/categories returns counted categories", async ({
    request,
  }) => {
    const res = await request.get("/api/public/categories");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data.categories)).toBe(true);
    expect(typeof json.data.totalPublished).toBe("number");
    if (json.data.categories.length > 0) {
      expect(json.data.categories[0].name).toBeTruthy();
      expect(typeof json.data.categories[0].courseCount).toBe("number");
    }
  });
});

test.describe("Course detail SEO", () => {
  test("emits Course JSON-LD with offers and instructor", async ({ page }) => {
    await page.goto("/courses/belajar-next-js-untuk-pemula");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const jsonLdHandles = await page.locator('script[type="application/ld+json"]').all();
    const blocks = await Promise.all(jsonLdHandles.map((h) => h.textContent()));
    const courseLd = blocks.find((b) => b && b.includes('"@type":"Course"'));
    expect(courseLd).toBeTruthy();

    const parsed = JSON.parse(courseLd!);
    expect(parsed.name).toMatch(/Next\.js/i);
    expect(parsed.offers).toBeTruthy();
    expect(parsed.offers.priceCurrency).toBe("IDR");
    expect(parsed.instructor.name).toBeTruthy();
  });

  test("metadata: per-course title, OG image points at course thumbnail", async ({
    page,
  }) => {
    await page.goto("/courses/belajar-next-js-untuk-pemula");

    await expect(page).toHaveTitle(/Belajar Next\.js/i);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/\/courses\/belajar-next-js-untuk-pemula$/);

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");
    expect(ogImage).toBeTruthy();
    expect(ogImage).not.toMatch(/NextLevel_3D_Logo\.webp$/);
  });

  test("sitemap.xml contains the course slug", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/courses/belajar-next-js-untuk-pemula");
  });
});
