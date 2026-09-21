import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupAuthApiMocks, setupEmployerApiMocks, MOCK_JOBS } from '../../helpers/mockApi';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';

test.describe('Employer Portal E2E Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  test('Employer can access dashboard and view recruitment overview', async ({ page }) => {
    await page.goto('/employer/dashboard');

    // Verify company / employer branding or layout is visible
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    // Verify navigation links exist (Quản lý tin, Ứng viên, etc.)
    await expect(
      page.locator('a, button').filter({ hasText: /tin tuyển dụng|hồ sơ ứng tuyển|ứng viên/i }).first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('Employer can view job posts management page', async ({ page }) => {
    await page.goto('/employer/job-posts');

    // Verify job post table or cards render
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });

    // Verify "Tạo tin tuyển dụng" / "Đăng tin" button exists
    const createJobBtn = page.locator('button, a').filter({ hasText: /tạo tin|đăng tin|thêm tin/i }).first();
    await expect(createJobBtn).toBeVisible();
  });

  test('Employer can view candidate applications on /employer/applied-profiles', async ({ page }) => {
    await page.goto('/employer/applied-profiles');

    // Verify candidate application record is listed
    await expect(page.getByText('Nguyen Van Ung Vien').first()).toBeVisible({ timeout: 20_000 });
  });
});
