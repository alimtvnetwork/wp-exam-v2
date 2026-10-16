import { test, expect } from '@playwright/test';

/**
 * Smoke: onboarding flow starts (R-4.1).
 * Clicks the landing CTA and verifies the application wizard mounts at /apply.
 */
test.describe('Onboarding Flow Start Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate from the hero CTA to the application wizard', async ({ page }) => {
    await page.click('button:has-text("Start Assessment")');

    // Wizard runs at /apply (App.tsx route -> WizardRunner)
    await expect(page).toHaveURL(/\/apply/);

    // First wizard step from src/components/forms/wizard-runner.tsx
    await expect(page.locator('text=Step 1: Target Position & Contact Information')).toBeVisible();
  });
});
