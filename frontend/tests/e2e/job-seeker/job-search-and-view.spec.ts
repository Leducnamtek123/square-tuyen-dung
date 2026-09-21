import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupJobsApiMocks, setupAuthApiMocks, MOCK_JOBS } from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Job Seeker Portal - Job Search & Application Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);
  });

  test('User can browse job listings on /jobs', async ({ page }) => {
    await page.goto('/jobs');

    // Verify page loads and job list is displayed
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_JOBS[1].job_name).first()).toBeVisible({ timeout: 20_000 });
  });

  test('User can view job detail page and company information', async ({ page }) => {
    const job = MOCK_JOBS[0];
    await page.goto(`/jobs/${job.slug}`);

    // Verify job details
    await expect(page.getByText(job.job_name).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(job.company.company_name).first()).toBeVisible();

    // Verify apply button exists
    const applyButton = page.locator('button').filter({ hasText: /nộp hồ sơ|ứng tuyển|apply/i }).first();
    await expect(applyButton).toBeVisible();
  });
});
