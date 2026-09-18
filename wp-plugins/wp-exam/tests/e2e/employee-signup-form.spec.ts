import { test, expect } from '@playwright/test';

test.describe('Employee Sign-Up & Onboarding Form E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should configure an employee sign-up form and test guest respondent submission', async ({ page }) => {
    // Switch Form Type to Employee Sign-Up in the builder
    const formTypeSelect = page.locator('select').first();
    await formTypeSelect.selectOption('employee_signup');

    // Toggle sequential off to have a single page form
    const sequentialSwitch = page.locator('#sequential-toggle');
    const isChecked = await sequentialSwitch.isChecked();
    if (isChecked) {
      await sequentialSwitch.click();
    }

    // Add employee sign-up specific fields
    await page.click('button:has-text("Email")');
    await page.click('button:has-text("Dropdown")');

    // Click Live Preview to test respondent experience
    await page.click('button:has-text("Live Preview")');

    // Fill guest employee information
    await page.fill('input[placeholder="e.g. Jane Doe"]', 'Jane Doe');
    await page.fill('input[placeholder="e.g. jane.doe@company.org"]', 'jane.doe@company.org');

    // Submit form
    await page.click('button:has-text("Submit")');

    // Verify submission confirmation card
    await expect(page.locator('text=Submission Received')).toBeVisible();
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    await expect(page.locator('text=jane.doe@company.org')).toBeVisible();
  });
});
