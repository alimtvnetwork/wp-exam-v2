import { test, expect } from '@playwright/test';

test.describe('Form Builder Drag-and-Drop & Dynamic Field Operations E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add fields and allow live interactive preview', async ({ page }) => {
    await expect(page.locator('text=WordPress Form & Quiz Builder')).toBeVisible();

    // Add Short Answer field
    await page.locator('[data-testid="quick-add-toolbar"] button:has-text("Short Answer")').click();

    // Add Rating field
    await page.locator('[data-testid="quick-add-toolbar"] button:has-text("Rating")').click();

    // Confirm that newly added fields appear in field list
    await expect(page.locator('[data-testid="field-type-badge"]:has-text("SHORT ANSWER")').first()).toBeVisible();
    await expect(page.locator('[data-testid="field-type-badge"]:has-text("RATING")').first()).toBeVisible();

    // Open Live Preview
    await page.click('button:has-text("Live Preview")');

    // Close Live Preview
    await page.click('button:has-text("Close Preview")');
  });
});
