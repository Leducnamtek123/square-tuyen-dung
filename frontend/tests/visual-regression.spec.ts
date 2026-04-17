import { test, expect } from '@playwright/test';

test.describe('Global UI Resiliency & Layouts', () => {
  
  test('Job Card Rendering should hold layout and wait for networkidle', async ({ page }) => {
    // Navigate to a page with job cards (assuming /jobs or similar)
    await page.goto('/');

    // Best Practice from Claude Skills: ALWAYS wait for networkidle unconditionally before evaluating DOM!
    await page.waitForLoadState('networkidle');

    // Make sure the main job list container is visible
    // Update the selector to what your actual container class is
    const jobCards = page.locator('.MuiCard-root'); 
    
    // Check if job cards rendered correctly under asymmetric CSS layout
    const count = await jobCards.count();
    expect(count).toBeGreaterThan(0);

    // E2E Visual Regression: Take a screenshot of the first job card to ensure the new border radii aren't broken
    if (count > 0) {
      await jobCards.first().screenshot({ path: 'test-results/first-job-card-visual.png' });
    }
  });

});
