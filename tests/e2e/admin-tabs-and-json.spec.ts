import { test, expect } from '@playwright/test';

test.describe('Admin Workspace & JSON Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate across all admin tabs and verify capabilities', async ({ page }) => {
    // 1. Invites Tab
    await page.click('button:has-text("Invites")');
    await expect(page.locator('text=User Invitations & Role Assignments')).toBeVisible();
    await page.fill('input[placeholder="e.g. employee@company.org"]', 'new.tester@company.org');
    await page.click('button:has-text("Send Invitation")');
    await expect(page.locator('span:has-text("new.tester@company.org")')).toBeVisible();

    // 2. History Tab
    await page.click('button:has-text("History")');
    await expect(page.locator('text=Quiz & Form Completion History')).toBeVisible();
    await expect(page.locator('text=David Miller')).toBeVisible();
    await page.click('button:has-text("View Answers")');
    await expect(page.locator('text=Submission Answers')).toBeVisible();
    await page.click('button:has-text("Close")');

    // 3. Email Gateway Tab
    await page.click('button:has-text("Email")');
    await expect(page.locator('text=Email Gateway & Dispatch Configuration')).toBeVisible();
    await expect(page.locator('text=Automated Notification Templates')).toBeVisible();

    // 4. SQLite Tab
    await page.click('button:has-text("SQLite")');
    await expect(page.locator('text=SQLite Embedded Storage Engine')).toBeVisible();
    await expect(page.locator('text=wp-content/uploads/wp-exam/wp-exam.sqlite')).toBeVisible();

    // 5. Builder & JSON Modal
    await page.click('button:has-text("Builder")');
    await expect(page.locator('text=WordPress Form & Quiz Builder')).toBeVisible();
    await page.click('button:has-text("JSON Import / Export")');
    await expect(page.locator('text=JSON Questions & Role Profile Engine')).toBeVisible();
    await page.click('button:has-text("Copy to Clipboard")');
    await page.click('button:has-text("Close")');
  });
});
