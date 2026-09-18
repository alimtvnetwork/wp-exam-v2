import { test, expect } from '@playwright/test';

test.describe('Form Builder Drag-and-Drop & Dynamic Field Operations E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add fields and allow live interactive preview', async ({ page }) => {
    await expect(page.locator('text=WordPress Form & Quiz Builder')).toBeVisible();

    // Add Short Answer field
    await page.click('button:has-text("Short Answer")');

    // Add Rating field
    await page.click('button:has-text("Rating")');

    // Confirm that newly added fields appear in field list
    await expect(page.locator('text=SHORT ANSWER').first()).toBeVisible();
    await expect(page.locator('text=RATING').first()).toBeVisible();

    // Open Live Preview
    await page.click('button:has-text("Live Preview")');

    // Close Live Preview
    await page.click('button:has-text("Close Preview")');
  });
});
