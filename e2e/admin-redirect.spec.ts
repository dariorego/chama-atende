import { test, expect } from "@playwright/test";

const SLUG = process.env.E2E_TENANT_SLUG || "bistro-verde";

test.describe("Admin tenant redirect", () => {
  test("unauthenticated: /{slug}/admin redirects to /login/{slug} preserving return path", async ({ page }) => {
    await page.goto(`/${SLUG}/admin`, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(new RegExp(`/login/${SLUG}(?:\\?.*)?$`));

    // The login form should be visible on the tenant login page
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();

    // React Router should carry the intended return path in history state
    const historyState = await page.evaluate(() => window.history.state);
    expect(JSON.stringify(historyState)).toContain(`/admin/${SLUG}`);
  });

  test("authenticated: visiting /login/{slug} bounces to /admin/{slug}", async ({ page }) => {
    const sessionJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
    const storageKey = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
    const cookiesJson = process.env.LOVABLE_BROWSER_SUPABASE_COOKIES_JSON;

    test.skip(!sessionJson || !storageKey, "No Supabase session injected; skipping authenticated path");

    if (cookiesJson) {
      const cookies = JSON.parse(cookiesJson).map((c: Record<string, unknown>) => ({
        ...c,
        url: "http://localhost:8080",
      }));
      await page.context().addCookies(cookies);
    }

    // Establish origin so localStorage write lands on the correct one
    await page.goto("/");
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key as string, value as string),
      [storageKey!, sessionJson!],
    );

    // Trigger the redirect chain from /{slug}/admin
    await page.goto(`/${SLUG}/admin`, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(new RegExp(`/admin/${SLUG}(?:/|$)`), { timeout: 15_000 });
  });
});