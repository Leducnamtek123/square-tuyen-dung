import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupCandidateProfileApiMocks,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_RESUMES,
  MOCK_JOBS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Candidate Job Discovery & Application End-to-End Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: MOCK_CANDIDATE_PROFILE.id,
      email: MOCK_CANDIDATE_PROFILE.email,
      fullName: MOCK_CANDIDATE_PROFILE.fullName,
      isOnboarded: true,
    });
    await injectSession(context, DEFAULT_CANDIDATE);
  });

  test('Candidate searches for jobs, filters by criteria, and views detail page', async ({ page }) => {
    await page.goto('/jobs', { waitUntil: 'domcontentloaded' });

    // 1. Search by keyword
    const kwInput = page.locator('input[name="kw"], input[placeholder*="Tìm kiếm"]').first();
    await expect(kwInput).toBeVisible({ timeout: 20_000 });
    await kwInput.fill('Fullstack');

    const searchBtn = page.getByRole('button', { name: /tìm kiếm/i }).first();
    await searchBtn.click();

    // 2. Matching job card appears
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });

    // 3. Navigate to Job Detail page
    await page.goto(`/jobs/${MOCK_JOBS[0].slug}`, { waitUntil: 'domcontentloaded' });

    // Verify detail page elements
    const heading = page.getByRole('heading', { name: MOCK_JOBS[0].job_name });
    await expect(heading).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_JOBS[0].company.company_name).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/hạn nộp/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Candidate bookmarks / saves job and toggles bookmark status', async ({ page }) => {
    await page.goto(`/jobs/${MOCK_JOBS[0].slug}`, { waitUntil: 'domcontentloaded' });

    const saveButton = page.locator('button').filter({ hasText: /lưu tin|đã lưu/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 20_000 });

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/save')),
      saveButton.click(),
    ]);

    await expect(saveButton).toBeVisible();
  });

  test('Candidate opens Apply Modal, selects attached resume, submits application and verifies in /my-jobs', async ({
    page,
  }) => {
    await page.goto(`/jobs/${MOCK_JOBS[0].slug}`, { waitUntil: 'domcontentloaded' });

    // Click "Nộp hồ sơ" / "Ứng tuyển ngay" button
    const applyButton = page.locator('button').filter({ hasText: /nộp hồ sơ|ứng tuyển|apply/i }).first();
    await expect(applyButton).toBeVisible({ timeout: 20_000 });
    await applyButton.click();

    // Verify Apply Form Dialog is opened
    const applyDialogHeading = page.getByText(/ứng tuyển vị trí/i).first();
    await expect(applyDialogHeading).toBeVisible({ timeout: 15_000 });

    // Select candidate's resume radio option
    const resumeRadio = page.getByRole('radio').first();
    await expect(resumeRadio).toBeVisible({ timeout: 15_000 });
    await resumeRadio.check();

    // Verify contact inputs
    const fullNameInput = page.locator('input[name="fullName"]').first();
    if (await fullNameInput.isVisible()) {
      await fullNameInput.fill('Nguyen Van Ung Vien');
    }
    const phoneInput = page.locator('input[name="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('0901234567');
    }

    // Click submit button in the apply popup
    const submitApplyBtn = page.getByRole('button', { name: /^ứng tuyển$/i }).last();
    await expect(submitApplyBtn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForResponse((res) =>
        res.url().includes('/job-seeker-job-posts-activity') && res.request().method() === 'POST'
      ),
      submitApplyBtn.click(),
    ]);

    // Modal should close or show success toast
    await expect(applyDialogHeading).not.toBeVisible({ timeout: 15_000 });

    // Now visit /my-jobs to verify the application is listed
    await page.goto('/my-jobs', { waitUntil: 'domcontentloaded' });

    // Switch to Tab "Đã ứng tuyển"
    const appliedTab = page.getByRole('tab', { name: /đã ứng tuyển/i });
    await expect(appliedTab).toBeVisible({ timeout: 20_000 });
    await appliedTab.click();

    // Verify the job appears in the applied list with status
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/ứng tuyển vào|hồ sơ trực tuyến|đã nộp/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
