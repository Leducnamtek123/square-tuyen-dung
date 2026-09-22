import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupOnboardingApiMocks,
  setupCandidateProfileApiMocks,
  MOCK_JOBS,
} from '../../helpers/mockApi';
import {
  injectSession,
  NON_ONBOARDED_CANDIDATE,
  DEFAULT_CANDIDATE,
} from '../../helpers/auth';

test.describe('Onboarding & Access Guard (/jobs/[slug] Apply Flow)', () => {
  test('Case 1: Un-onboarded candidate clicking apply triggers OnboardingRequiredDialog and redirects to onboarding', async ({
    page,
    context,
  }) => {
    // Setup mocks for non-onboarded candidate
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupOnboardingApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: false,
      fullName: 'Ung Vien Moi',
      email: 'candidate.new@infohr.vn',
      id: 102,
    });
    await injectSession(context, NON_ONBOARDED_CANDIDATE);

    const job = MOCK_JOBS[0];
    await page.goto(`/jobs/${job.slug}`);

    // Verify job detail page loaded
    await expect(page.getByRole('heading', { name: job.job_name })).toBeVisible({ timeout: 20_000 });

    // Locate and click Apply button
    const applyButton = page
      .locator('button')
      .filter({ hasText: /nộp hồ sơ|ứng tuyển|apply/i })
      .first();
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    // Verify OnboardingRequiredDialog is displayed
    await expect(
      page.getByText(/Cần hoàn tất hồ sơ để ứng tuyển/i)
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/Bạn cần hoàn thiện thông tin hồ sơ cơ bản/i)
    ).toBeVisible();

    // Verify 'Hoàn tất hồ sơ ngay' button exists
    const completeProfileButton = page.getByRole('button', {
      name: /Hoàn tất hồ sơ ngay/i,
    });
    await expect(completeProfileButton).toBeVisible();

    // Click 'Hoàn tất hồ sơ ngay' and verify navigation to /onboarding/candidate
    await completeProfileButton.click();
    await expect(page).toHaveURL(/\/onboarding\/candidate/);
    await expect(
      page.getByText(/Mục tiêu & Nguyện vọng nghề nghiệp/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('Case 2: Onboarded candidate clicking apply opens normal application form (ApplyCard / FormPopup)', async ({
    page,
    context,
  }) => {
    // Setup mocks for fully onboarded candidate
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupOnboardingApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: true,
      fullName: 'Nguyen Van Ung Vien',
      email: 'candidate.e2e@infohr.vn',
      id: 101,
    });
    await injectSession(context, DEFAULT_CANDIDATE);

    const job = MOCK_JOBS[0];
    await page.goto(`/jobs/${job.slug}`);

    // Verify job detail page loaded
    await expect(page.getByRole('heading', { name: job.job_name })).toBeVisible({ timeout: 20_000 });

    // Locate and click Apply button
    const applyButton = page
      .locator('button')
      .filter({ hasText: /nộp hồ sơ|ứng tuyển|apply/i })
      .first();
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    // Verify OnboardingRequiredDialog is NOT visible
    await expect(
      page.getByText(/Cần hoàn tất hồ sơ để ứng tuyển/i)
    ).not.toBeVisible();

    // Verify normal application form (ApplyCard / FormPopup) dialog opens
    const applyDialog = page.getByRole('dialog');
    await expect(applyDialog).toBeVisible({ timeout: 10_000 });

    // Verify dialog header displays position title / caption
    await expect(
      applyDialog.getByText(/Ứng tuyển vị trí|Ứng tuyển/i).first()
    ).toBeVisible();
    await expect(
      applyDialog.getByText(job.job_name).first()
    ).toBeVisible();

    // Verify apply form fields (Full name, Email, Phone, Resume list) are present
    const nameInput = applyDialog
      .locator('#fullName, input[name="fullName"]')
      .or(applyDialog.getByPlaceholder(/họ và tên/i))
      .first();
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('Nguyen Van Ung Vien');

    const emailInput = applyDialog
      .locator('#email, input[name="email"]')
      .or(applyDialog.getByPlaceholder(/email/i))
      .first();
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('candidate.e2e@infohr.vn');

    // Verify submit button is present inside the popup
    const submitButton = applyDialog.getByRole('button', { name: /Ứng tuyển/i }).first();
    await expect(submitButton).toBeVisible();
  });
});
