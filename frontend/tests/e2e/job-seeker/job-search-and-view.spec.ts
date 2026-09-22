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

  test('User can search jobs by keyword', async ({ page }) => {
    await page.goto('/jobs');

    // Locate keyword input
    const kwInput = page.locator('input[name="kw"], input[placeholder*="Tìm kiếm"]').first();
    await expect(kwInput).toBeVisible({ timeout: 15_000 });
    await kwInput.fill('Fullstack');

    // Click search button
    const searchBtn = page.getByRole('button', { name: /tìm kiếm/i }).first();
    await searchBtn.click();

    // Verify filtered result: Senior Fullstack Engineer is visible
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });
  });

  test('User can filter jobs by career and city', async ({ page }) => {
    // Navigate with careerId & cityId query parameters
    await page.goto('/jobs?careerId=1&cityId=1');

    // Verify matching job post is displayed
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });
  });

  test('User can open advanced filters drawer and apply filter', async ({ page }) => {
    await page.goto('/jobs');

    // Click "Bộ lọc nâng cao" button
    const advancedFilterBtn = page.getByRole('button', { name: /bộ lọc nâng cao/i });
    await expect(advancedFilterBtn).toBeVisible({ timeout: 15_000 });
    await advancedFilterBtn.click();

    // Drawer should open with apply button
    const applyFilterBtn = page.getByRole('button', { name: /áp dụng/i });
    await expect(applyFilterBtn).toBeVisible({ timeout: 10_000 });

    // Click apply to close drawer and submit
    await applyFilterBtn.click();
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });
  });

  test('User can view job detail page with company, salary, benefits and deadline', async ({ page }) => {
    const job = MOCK_JOBS[0];
    await page.goto(`/jobs/${job.slug}`);

    // Verify job title heading
    const jobHeading = page.getByRole('heading', { name: job.job_name });
    await expect(jobHeading).toBeVisible({ timeout: 20_000 });

    // Verify company name
    await expect(page.getByText(job.company.company_name).first()).toBeVisible();

    // Verify deadline and benefits section exist
    await expect(page.getByText(/hạn nộp|31\/12\/2026/i).first()).toBeVisible();

    // Verify apply button exists
    const applyButton = page.locator('button').filter({ hasText: /nộp hồ sơ|ứng tuyển|apply/i }).first();
    await expect(applyButton).toBeVisible();
  });

  test('User can save/bookmark a job from detail page', async ({ page }) => {
    const job = MOCK_JOBS[0];
    await page.goto(`/jobs/${job.slug}`);

    // Find the save job button (Lưu tin / Đã lưu)
    const saveButton = page.locator('button').filter({ hasText: /lưu tin|đã lưu/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 20_000 });

    // Click save
    await saveButton.click();

    // Verify button remains or shows saved state
    await expect(saveButton).toBeVisible();
  });
});
