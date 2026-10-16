import { test, expect } from '@playwright/test';

/**
 * Smoke: landing page renders (R-4.1).
 * Verifies the public hero surface loads with its headline and primary CTA.
 */
test.describe('Landing Page Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the hero headline and primary call to action', async ({ page }) => {
    // Hero headline from src/components/public/LandingPage.tsx
    await expect(page.locator('h1', { hasText: 'Intelligent Exams' })).toBeVisible();

    // Primary CTA that starts the onboarding flow
    await expect(page.locator('button:has-text("Start Assessment")')).toBeVisible();
  });
});
