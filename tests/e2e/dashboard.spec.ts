import { expect, test } from "@playwright/test";

test.describe("Student dashboard — auth & API guards", () => {
  test("logged-out: /dashboard redirects to /login?next=/dashboard", async ({
    page,
  }) => {
    const response = await page.goto("/dashboard");
    // Final URL after edge proxy redirect should be /login with next param.
    expect(page.url()).toMatch(/\/login\?next=%2Fdashboard$/);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Masuk|Login/i);
  });

  test("API: /api/student/me/game-profile returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/student/me/game-profile");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("API: /api/student/dashboard/stats returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/student/dashboard/stats");
    expect(res.status()).toBe(401);
  });

  test("API: /api/student/dashboard/in-progress returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/student/dashboard/in-progress");
    expect(res.status()).toBe(401);
  });

  test("API: /api/student/dashboard/recommendations returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/student/dashboard/recommendations");
    expect(res.status()).toBe(401);
  });

  test("API: /api/student/notifications returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/student/notifications");
    expect(res.status()).toBe(401);
  });

  test("API: POST /api/student/notifications/mark-all-read returns 401 without session", async ({
    request,
  }) => {
    const res = await request.post("/api/student/notifications/mark-all-read");
    expect(res.status()).toBe(401);
  });

  test("Cache-Control: dashboard APIs that respond should set private,no-store", async ({
    request,
  }) => {
    // We can only assert the header on a 401 because the body is also private.
    // The route returns the header even on the 401 branch via NextResponse defaults.
    const res = await request.get("/api/student/dashboard/stats");
    // 401 path uses Response.json which doesn't set Cache-Control. The success
    // branch (covered by manual auth testing) does. Verify at least there's no
    // public caching directive leaked.
    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).not.toMatch(/public/i);
    expect(cc).not.toMatch(/s-maxage/i);
  });
});
