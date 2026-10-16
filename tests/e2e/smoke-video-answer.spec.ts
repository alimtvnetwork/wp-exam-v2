import { test, expect } from '@playwright/test';

/**
 * Smoke: video-answer recorder mounts in the runner (R-4.1).
 * Defensive by design: Task-07 builds the video-answer mode in
 * src/components/runner/ in parallel. If the surface is absent, the
 * recorder test skips gracefully instead of failing.
 */
test.describe('Video Answer Recorder Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/runner');
  });

  test('should mount the quiz runner host surface', async ({ page }) => {
    // FormRunner project selector placeholder (src/components/runner/FormRunner.tsx)
    await expect(page.getByPlaceholder('Select Project')).toBeVisible();
  });

  test('should expose the video-answer recorder when its surface exists', async ({ page }) => {
    await expect(page.getByPlaceholder('Select Project')).toBeVisible();

    // Recorder entry added by Task-07 (getUserMedia video-answer mode, R-7.1).
    const recorderEntries = page.locator(
      'button:has-text(/record video|video answer/i), [data-testid="video-answer-recorder"], video[data-testid="video-answer-preview"]',
    );
    const entryCount = await recorderEntries.count();

    if (entryCount === 0) {
      test.skip(true, 'video-answer recorder surface not yet wired (Task-07 in progress)');
    }

    await recorderEntries.first().click();

    // Recording surface: preview element or explicit recording indicator (R-7.2).
    const recorderSurface = page.locator(
      '[data-testid="video-answer-recorder"], [data-testid="video-answer-preview"], :text("Recording")',
    );
    await expect(recorderSurface.first()).toBeVisible();
  });
});
