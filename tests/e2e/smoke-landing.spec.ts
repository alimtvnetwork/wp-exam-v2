import { test, expect } from '@playwright/test';

/**
 * Smoke: landing page renders (R-4.1).
 * Verifies the public hero surface loads with its headline and primary CTA.
 */
test.describe('Landing Page Smoke', () => {
  test('should render the hero headline and primary call to action', async ({ page }) => {
    await page.goto('/?layout=v1', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1', { hasText: 'Intelligent Quizzes' })).toBeVisible();
    await expect(page.locator('button:has-text("Start Assessment")')).toBeVisible();
  });

  test('renders the V6 command center and opens the candidate portal', async ({ page }) => {
    await page.goto('/?layout=v6', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /run every assessment like a mission-critical system/i }),
    ).toBeVisible();
    await expect(page.getByRole('complementary', { name: /operational proof/i })).toBeVisible();

    await page.getByRole('button', { name: /start assessment/i }).click();
    await expect(page).toHaveURL(/\/portal/);
  });

  test('renders the V7 yield studio without mobile overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?layout=v7', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /turn applicant volume into qualified hiring signal/i }),
    ).toBeVisible();
    await expect(page.getByText('Transparent yield calculator')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
