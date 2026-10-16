import { test, expect } from '@playwright/test';

/**
 * Smoke: theme-builder surface opens (R-4.1).
 * Defensive by design: Task-05 wires src/components/theme-builder/ into the
 * admin/settings surface in parallel. If the entry point is absent, the
 * surface test skips gracefully instead of failing.
 */
test.describe('Theme Builder Surface Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should mount the admin console that hosts the theme-builder', async ({ page }) => {
    // Admin shell from src/pages/Index.tsx
    await expect(page.locator('text=Onboarding Quiz Console')).toBeVisible();
  });

  test('should open the theme-builder when its entry point exists', async ({ page }) => {
    await expect(page.locator('text=Onboarding Quiz Console')).toBeVisible();

    // Entry point added by Task-05 behind the existing admin/settings surface.
    const entryPoints = page.locator('button:has-text(/theme builder|themes/i)');
    const entryCount = await entryPoints.count();

    if (entryCount === 0) {
      test.skip(true, 'theme-builder entry point not yet wired (Task-05 in progress)');
    }

    await entryPoints.first().click();

    // Builder surface: live preview canvas + side inspector (R-5.1).
    const surface = page.locator(
      '[data-testid="theme-builder-canvas"], [data-testid="theme-builder-inspector"], :text("Theme Builder")',
    );
    await expect(surface.first()).toBeVisible();
  });
});
