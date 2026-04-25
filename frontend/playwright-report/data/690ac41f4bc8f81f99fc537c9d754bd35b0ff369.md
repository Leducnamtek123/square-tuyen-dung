# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-regression.spec.ts >> Global UI Resiliency & Layouts >> Job Card Rendering should hold layout and wait for networkidle
- Location: tests\visual-regression.spec.ts:5:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [active]:
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert [ref=e10]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Global UI Resiliency & Layouts', () => {
  4  |   
  5  |   test('Job Card Rendering should hold layout and wait for networkidle', async ({ page }) => {
  6  |     // Navigate to a page with job cards (assuming /jobs or similar)
  7  |     await page.goto('/');
  8  | 
  9  |     // Best Practice from Claude Skills: ALWAYS wait for networkidle unconditionally before evaluating DOM!
  10 |     await page.waitForLoadState('networkidle');
  11 | 
  12 |     // Make sure the main job list container is visible
  13 |     // Update the selector to what your actual container class is
  14 |     const jobCards = page.locator('.MuiCard-root'); 
  15 |     
  16 |     // Check if job cards rendered correctly under asymmetric CSS layout
  17 |     const count = await jobCards.count();
> 18 |     expect(count).toBeGreaterThan(0);
     |                   ^ Error: expect(received).toBeGreaterThan(expected)
  19 | 
  20 |     // E2E Visual Regression: Take a screenshot of the first job card to ensure the new border radii aren't broken
  21 |     if (count > 0) {
  22 |       await jobCards.first().screenshot({ path: 'test-results/first-job-card-visual.png' });
  23 |     }
  24 |   });
  25 | 
  26 | });
  27 | 
```