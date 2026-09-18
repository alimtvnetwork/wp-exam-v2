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

  test('should run the Focus Quiz through Reading, Checklist, and Quiz stages with Anti-Cheat', async ({ page }) => {
    await page.click('button:has-text("Focus Quiz")');

    // 1. Intro Hero Screen
    await expect(page.locator('text=Personalized Writing Assessment')).toBeVisible();
    await expect(page.locator('text=right place!')).toBeVisible();
    await page.click('button:has-text("Let\'s do it")');

    // 2. Stage 1: Reading Documentation & Embedded Video
    await expect(page.locator('text=Step 1: Reading & Lectures')).toBeVisible();
    await expect(page.locator('text=Core Architecture & Split Database Design')).toBeVisible();
    await page.click('button:has-text("Next Page")');

    await expect(page.locator('text=Security, Client IP Tracking & Anti-Abuse')).toBeVisible();
    await page.click('button:has-text("Proceed to Checklist")');

    // 3. Stage 2: Practical Verification Checklist
    await expect(page.locator('text=Step 2: Practical Verification')).toBeVisible();
    await expect(page.locator('text=Practical Verification Checklist')).toBeVisible();
    
    // Toggle mandatory verification items
    await page.click('text=Have you read the documentation sections');
    await page.click('text=Have you watched the technical walkthrough video');
    await page.click('text=Have you verified the SQLite database migrations locally');
    await page.click('button:has-text("Proceed to Quiz")');

    // 4. Stage 3: Question 1 (What do you write? - Multi-select)
    await expect(page.locator('text=do you write?')).toBeVisible();
    await page.click('button:has-text("Messages & Emails")');
    await page.click('button:has-text("Documents")');
    await page.click('button:has-text("Continue")');

    // Question 2 (Problems)
    await expect(page.locator('text=problems')).toBeVisible();
    await page.click('button:has-text("Writing takes too long")');
    await page.click('button:has-text("Continue")');

    // Question 3 (Main problem with typing)
    await expect(page.locator('text=main problem')).toBeVisible();
    await page.click('button:has-text("Slow and time-consuming")');
    await page.click('button:has-text("Continue")');

    // Question 4 (Social media 2-column grid)
    await expect(page.locator('text=social media platforms')).toBeVisible();
    await page.click('button:has-text("LinkedIn")');
    await page.click('button:has-text("Continue")');

    // Question 5 (URL submission with live verification)
    await expect(page.locator('text=workflow map')).toBeVisible();
    await page.fill('input[placeholder*="docs.google.com"]', 'https://docs.google.com/document/d/sample123');
    await expect(page.locator('text=Valid Google Docs verified')).toBeVisible();
    await page.click('button:has-text("Complete Assessment")');

    // 5. Stage 4: Results Screen & Anti-Cheat verification
    await expect(page.locator('h2')).toContainText(/(Assessment Completed!|Review & Try Again)/);
    await expect(page.locator('text=Notification Chain Dispatched:')).toBeVisible();
    await expect(page.locator('button:has-text("Retake Assessment")')).toBeVisible();
  });

  test('should verify Analytics Dashboard with High Failure Alerts and Public Sharing Preview', async ({ page }) => {
    await page.click('button:has-text("Analytics")');

    // Verify Dashboard Header
    await expect(page.locator('text=Performance & Question Failure Analytics')).toBeVisible();

    // Verify Metric KPI Cards
    await expect(page.locator('text=Total Assigned')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=Failed')).toBeVisible();
    await expect(page.locator('text=Pass Rate')).toBeVisible();

    // Verify Question-by-Question Breakdown table & High Failure Alert
    await expect(page.locator('text=Question-by-Question Failure Rate Breakdown')).toBeVisible();
    await expect(page.locator('text=High Failure Alert').first()).toBeVisible();

    // Verify Public Preview View Modal
    await page.click('button:has-text("Preview View")');
    await expect(page.locator('text=Public Candidate Difficulty Preview')).toBeVisible();
    await expect(page.locator('text=Overall Course Difficulty')).toBeVisible();
    await page.click('button:has-text("Close Preview")');
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

  test('should verify Question Reporting triage in Analytics and Project JSON import/export', async ({ page }) => {
    // 1. Verify Reported Questions & Bug Triage in Analytics
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('text=Reported Questions & Bug Triage')).toBeVisible();
    await expect(page.locator('text=Technical Bugs')).toBeVisible();
    await expect(page.locator('button:has-text("Bugs")')).toBeVisible();
    await page.click('button:has-text("Bugs")');
    await expect(page.locator('text=Safari 17')).toBeVisible();

    // 2. Verify Projects JSON Export and Recursive Sub-Projects
    await page.click('button:has-text("Projects")');
    await expect(page.locator('text=Curriculum Tree')).toBeVisible();
    await expect(page.locator('text=Hardware Security Keys & YubiKey').first()).toBeVisible();
    await expect(page.locator('button:has-text("Export JSON")')).toBeVisible();
    await page.click('button:has-text("Import JSON")');
    await expect(page.locator('text=Import Project from JSON')).toBeVisible();
    await page.click('button:has-text("Cancel")');
  });
});
