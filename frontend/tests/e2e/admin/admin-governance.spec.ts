import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupAuthApiMocks, MOCK_JOBS } from '../../helpers/mockApi';
import { injectSession, DEFAULT_ADMIN } from '../../helpers/auth';

test.describe('Admin Governance & Moderation E2E Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'ADMIN',
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      fullName: DEFAULT_ADMIN.fullName,
    });

    // Mock Admin jobs management endpoint
    await page.route(/\/api\/job\/web\/admin-job-posts\/\?*.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: MOCK_JOBS.length,
          results: MOCK_JOBS.map((j) => ({
            ...j,
            status: 1, // Pending or approved
            status_name: 'Đã duyệt',
          })),
        }),
      });
    });

    // Mock Audit Logs endpoint
    await page.route(/\/api\/common\/admin\/audit-logs\/\?*.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 2,
          results: [
            {
              id: 1,
              action: 'LOGIN',
              actor_email: 'admin.e2e@infohr.vn',
              resource_type: 'Auth',
              resource_id: '303',
              ip_address: '127.0.0.1',
              create_at: '2026-09-21T07:00:00Z',
            },
            {
              id: 2,
              action: 'APPROVE_JOB',
              actor_email: 'admin.e2e@infohr.vn',
              resource_type: 'JobPost',
              resource_id: '101',
              ip_address: '127.0.0.1',
              create_at: '2026-09-21T07:15:00Z',
            },
          ],
        }),
      });
    });

    await injectSession(context, DEFAULT_ADMIN);
  });

  test('Admin can access admin jobs moderation page on /admin/jobs', async ({ page }) => {
    await page.goto('/admin/jobs');

    // Verify job item is listed
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });
  });

  test('Admin can view system audit logs on /admin/audit-logs', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    // Verify audit log page rendered with email or action
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('admin.e2e@infohr.vn').first()).toBeVisible({ timeout: 20_000 });
  });
});
