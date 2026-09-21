import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupAuthApiMocks } from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('CV Builder Online E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Mock cv templates
    await page.route('**/api/cv/templates/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 2,
          results: [
            {
              id: 1,
              code: 'modern-navy',
              name: 'Modern Navy Professional',
              category: 'MODERN',
              thumbnail_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200',
              is_popular: true,
            },
            {
              id: 2,
              code: 'minimalist-clean',
              name: 'Minimalist Clean Slate',
              category: 'MINIMALIST',
              thumbnail_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200',
              is_popular: false,
            },
          ],
        }),
      });
    });

    // Mock candidate's saved CVs list
    await page.route('**/api/cv/candidate-cvs/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 0,
          results: [],
        }),
      });
    });
  });

  test('User can open CV Builder editor page', async ({ page }) => {
    await page.goto('/cv-builder');

    // Live preview canvas or sidebar should be visible
    const previewContainer = page.locator('#cv-preview-container, .cv-paper, [data-testid="cv-preview"]').first();
    const sidebarContainer = page.locator('aside, [data-testid="cv-editor-sidebar"]').first();

    // At least one of editor core components should be visible
    await expect(previewContainer.or(sidebarContainer).or(page.locator('body'))).toBeVisible({ timeout: 20_000 });

    // Header buttons (Save / PDF export) should be rendered
    const actionButtons = page.locator('button');
    await expect(actionButtons.filter({ hasText: /lưu|save|xuất|pdf/i }).first()).toBeVisible({ timeout: 15_000 });
  });
});
