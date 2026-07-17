import { test, expect, type Page } from "@playwright/test";

const SLUGS = (process.env.E2E_TENANT_SLUGS || "bistro-verde,cafe-central")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function seedSupabaseSession(page: Page): Promise<boolean> {
  const sessionJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
  const storageKey = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
  const cookiesJson = process.env.LOVABLE_BROWSER_SUPABASE_COOKIES_JSON;
  if (!sessionJson || !storageKey) return false;

  if (cookiesJson) {
    const cookies = JSON.parse(cookiesJson).map((c: Record<string, unknown>) => ({
      ...c,
      url: "http://localhost:8080",
    }));
    await page.context().addCookies(cookies);
  }
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [storageKey, sessionJson],
  );
  return true;
}

test.describe("Admin tenant redirect — multi-tenant isolation", () => {
  for (const slug of SLUGS) {
    test(`[${slug}] unauthenticated: /${slug}/admin redirects to /login/${slug} preserving return path`, async ({ page }) => {
      await page.goto(`/${slug}/admin`, { waitUntil: "networkidle" });

      await expect(page).toHaveURL(new RegExp(`/login/${slug}(?:\\?.*)?$`));
      await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
      await expect(page.getByLabel(/senha/i)).toBeVisible();

      // The return path stored in history must point back to the same tenant's admin
      const historyState = await page.evaluate(() => window.history.state);
      expect(JSON.stringify(historyState)).toContain(`/admin/${slug}`);

      // Cross-tenant safety: no OTHER slug's admin path leaked into history state
      for (const otherSlug of SLUGS) {
        if (otherSlug === slug) continue;
        expect(JSON.stringify(historyState)).not.toContain(`/admin/${otherSlug}`);
      }
    });

    test(`[${slug}] authenticated: /${slug}/admin lands on /admin/${slug}`, async ({ page }) => {
      const seeded = await seedSupabaseSession(page);
      test.skip(!seeded, "No Supabase session injected; skipping authenticated path");

      await page.goto(`/${slug}/admin`, { waitUntil: "networkidle" });

      // After auth we should end up on the SAME slug's admin, never another tenant's
      await expect(page).toHaveURL(new RegExp(`/admin/${slug}(?:/|$)`), { timeout: 15_000 });
    });
  }
});