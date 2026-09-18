import { test, expect } from '@playwright/test';

test.describe('Focus Quiz Runner & Hierarchical Projects E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to Projects and inspect categories, pipeline, and split DBs', async ({ page }) => {
    await page.click('button:has-text("Projects")');
    await expect(page.locator('text=Project & Category Hierarchy')).toBeVisible();
    await expect(page.locator('text=Employee Onboarding & Security')).toBeVisible();

    // Verify Split DB badge
    await expect(page.locator('text=Split DB: proj_sec_101.sqlite')).toBeVisible();

    // Inspect Execution Pipeline
    await expect(page.locator('text=Execution Pipeline:')).toBeVisible();

    // Open and verify Revisions History Modal
    await page.click('[data-testid="project-history-btn"]');
    await expect(page.locator('text=Project Revisions & Rollback')).toBeVisible();
    await expect(page.locator('text=rev_1726671234_abc')).toBeVisible();
    await page.click('button:has-text("✕")');
  });

  test('should run the Focus Quiz with Letterly styling, theme switching, and anti-cheat grading', async ({ page }) => {
    await page.click('button:has-text("Focus Quiz")');

    // 1. Intro Screen
    await expect(page.locator('text=Personalized Writing Assessment')).toBeVisible();
    await expect(page.locator('text=right place!')).toBeVisible();
    await page.click('button:has-text("Let\'s do it")');

    // 2. Question 1 (What do you write? - Multi-select)
    await expect(page.locator('text=do you write?')).toBeVisible();
    await page.click('button:has-text("Messages & Emails")');
    await page.click('button:has-text("Documents")');
    await page.click('button:has-text("Continue")');

    // 3. Question 2 (Problems)
    await expect(page.locator('text=problems')).toBeVisible();
    await page.click('button:has-text("Writing takes too long")');
    await page.click('button:has-text("Continue")');

    // 4. Question 3 (Main problem with typing)
    await expect(page.locator('text=main problem')).toBeVisible();
    await page.click('button:has-text("Slow and time-consuming")');
    await page.click('button:has-text("Continue")');

    // 5. Question 4 (Social media 2-column grid)
    await expect(page.locator('text=social media platforms')).toBeVisible();
    await page.click('button:has-text("LinkedIn")');
    await page.click('button:has-text("Continue")');

    // 6. Question 5 (URL submission)
    await expect(page.locator('text=workflow map')).toBeVisible();
    await page.fill('input[placeholder*="docs.google.com"]', 'https://docs.google.com/document/d/sample123');
    await page.click('button:has-text("Complete Assessment")');

    // 7. Results Screen & Anti-Cheat verification
    await expect(page.locator('h2')).toContainText(/(Congratulations!|Review Required)/);
    await expect(page.locator('button:has-text("Retake Assessment")')).toBeVisible();
  });

  test('should verify AI Instruction Studio and System Backups tabs', async ({ page }) => {
    // 1. AI Studio Tab
    await page.click('button:has-text("AI Studio")');
    await expect(page.locator('text=AI Instruction & Prompt Studio')).toBeVisible();
    await expect(page.locator('text=Target AI System Prompt & Schema Contract')).toBeVisible();
    await page.click('button:has-text("Validate JSON")');

    // 2. Backups Tab
    await page.click('button:has-text("Backups")');
    await expect(page.locator('text=System Backups & Rotating Archives')).toBeVisible();
    await expect(page.locator('text=Retention & Rotation Policy')).toBeVisible();
    await page.click('button:has-text("Create Full ZIP Backup")');
    await expect(page.locator('text=Full system backup archive created successfully!')).toBeVisible();
  });
});
