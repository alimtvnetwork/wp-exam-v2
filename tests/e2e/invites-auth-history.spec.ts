import { test, expect } from '@playwright/test';

test.describe('User Invites, Role Authentication & Completion History E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should invite a user, authenticate in runner via token, submit quiz, and verify in history', async ({ page }) => {
    // 1. Navigate to Invites tab
    await page.click('button:has-text("Invites")');
    await expect(page.locator('text=User Invitations & Role Assignments')).toBeVisible();

    // 2. Create new candidate invite
    const candidateEmail = 'candidate.jane@domain.test';
    await page.fill('input[placeholder="e.g. employee@company.org"]', candidateEmail);
    await page.selectOption('form select', 'subscriber');
    await page.click('button:has-text("Send Invitation")');

    // Confirm invite created in the list
    await expect(page.locator(`span:has-text("${candidateEmail}")`)).toBeVisible();

    // 3. Click "Test in Runner" for the newly created candidate at top of list
    await page.locator('button:has-text("Test in Runner")').first().click();

    // 4. Verify Live Runner is now open and candidate is authenticated
    await expect(page.locator('text=✓ Verified Respondent')).toBeVisible();
    await expect(page.locator(`text=${candidateEmail}`)).toBeVisible();

    // 5. Answer sequential quiz questions
    await expect(page.locator('text=Step 1 of')).toBeVisible();
    await page.click('label:has-text("HyperText Markup Language")');
    await page.click('button:has-text("Next")');

    await expect(page.locator('text=Step 2 of')).toBeVisible();
    await page.click('label:has-text("False")');
    await page.click('button:has-text("Submit Response")');

    // 6. Verify result completion card
    await expect(page.locator('text=Quiz Completed')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
    await expect(page.locator('text=Passed')).toBeVisible();
    await expect(page.locator('text=Response recorded in Completion History & SQLite storage engine.')).toBeVisible();

    // 7. Navigate to History tab and confirm the submission appears
    await page.click('button:has-text("History")');
    await expect(page.locator('text=Quiz & Form Completion History')).toBeVisible();
    await expect(page.locator(`text=${candidateEmail}`)).toBeVisible();

    // 8. Open submission detail modal
    await page.locator('button:has-text("View Answers")').first().click();

    await expect(page.locator('text=Submission Answers: candidate jane')).toBeVisible();
    await expect(page.locator('text=HyperText Markup Language').first()).toBeVisible();
    await page.click('button:has-text("Close")');
  });

  test('should load profile templates and verify role-based anti-cheat JSON export', async ({ page }) => {
    // 1. Open JSON Engine modal
    await page.click('button:has-text("JSON Import / Export")');
    await expect(page.locator('text=JSON Questions & Role Profile Engine')).toBeVisible();

    // 2. Load 1-click Technical Quiz template
    await page.click('button:has-text("Technical Quiz")');
    await expect(page.locator('text=Loaded "Modern Full-Stack Technical Quiz" into the form builder!')).toBeVisible();

    // 3. Switch Role Filter to Subscriber (Anti-Cheat)
    await page.selectOption('select:has-text("All Roles")', 'subscriber');
    await expect(page.locator('text=Anti-Cheat Active: Correct answers have been stripped')).toBeVisible();

    // 4. Verify modal textarea does not expose correctAnswer
    const jsonContent = await page.locator('.fixed textarea').inputValue();
    expect(jsonContent).not.toContain('"correctAnswer"');

    // 5. Switch Role Filter to Editor and verify answers are included
    await page.selectOption('select:has-text("All Roles")', 'editor');
    const editorJsonContent = await page.locator('.fixed textarea').inputValue();
    expect(editorJsonContent).toContain('"correctAnswer"');

    await page.click('button:has-text("Close")');
  });
});
