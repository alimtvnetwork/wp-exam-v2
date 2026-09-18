import { test, expect } from '@playwright/test';

test.describe('Sequential Quiz Feature E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the builder with default sequential quiz and switch to public runner', async ({ page }) => {
    // Verify title and default form type
    await expect(page.locator('text=WordPress Form & Quiz Builder')).toBeVisible();

    // Click "Public Runner Demo" tab
    await page.click('button:has-text("Public Runner Demo")');

    // Confirm Sequential Quiz Wizard is active
    await expect(page.locator('text=Step 1 of')).toBeVisible();
    await expect(page.locator('text=What does HTML stand for?')).toBeVisible();

    // Verify Previous button is initially disabled on first step
    const prevBtn = page.locator('button:has-text("Previous")');
    await expect(prevBtn).toBeDisabled();

    // Select the correct option: "HyperText Markup Language"
    await page.click('label:has-text("HyperText Markup Language")');

    // Click Next step
    await page.click('button:has-text("Next")');

    // Verify Step 2 is now visible: "CSS is used for structuring webpage content."
    await expect(page.locator('text=Step 2 of')).toBeVisible();
    await expect(page.locator('text=CSS is used for structuring webpage content.')).toBeVisible();

    // Select the correct answer: "False"
    await page.click('label:has-text("False")');

    // Submit Response
    await page.click('button:has-text("Submit Response")');

    // Verify Quiz Results Completion Card
    await expect(page.locator('text=Quiz Completed')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
    await expect(page.locator('text=Passed')).toBeVisible();
  });
});
