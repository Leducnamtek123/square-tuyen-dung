import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupJobsApiMocks,
  setupCandidateProfileApiMocks,
  MOCK_CANDIDATE_PROFILE,
  MOCK_JOBS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Job Seeker Portal - Profile & My Jobs Management', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: MOCK_CANDIDATE_PROFILE.id,
      email: MOCK_CANDIDATE_PROFILE.email,
      fullName: MOCK_CANDIDATE_PROFILE.fullName,
    });
    await injectSession(context, DEFAULT_CANDIDATE);
  });

  test('User can view candidate profile page and personal details on /profile', async ({ page }) => {
    await page.goto('/profile');

    // Candidate full name and title should be visible
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.fullName).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.title).first()).toBeVisible();

    // Verify contact information
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.email).first()).toBeVisible();
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.phone).first()).toBeVisible();
  });

  test('User can open profile edit modal and update profile details', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.fullName).first()).toBeVisible({ timeout: 20_000 });

    // Click "Chỉnh sửa" button
    const editBtn = page.getByRole('button', { name: /chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();

    // Verify modal is opened
    const modalHeading = page.getByRole('heading', { name: /chỉnh sửa thông tin|cập nhật hồ sơ/i }).or(page.getByText('Chỉnh sửa thông tin cá nhân')).first();
    await expect(modalHeading).toBeVisible({ timeout: 10_000 });

    // Fill new job title in modal
    const titleInput = page.getByLabel(/vị trí \/ chức danh/i).or(page.getByLabel(/chức danh/i)).first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Senior Lead Architect');
    }

    // Click "Lưu thay đổi" or save button in dialog actions
    const saveBtn = page.getByRole('button', { name: /lưu thay đổi|lưu/i }).last();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Modal should close
    await expect(modalHeading).not.toBeVisible({ timeout: 10_000 });
  });

  test('User can view saved jobs and applied jobs on /my-jobs', async ({ page }) => {
    await page.goto('/my-jobs');

    // Tab 1: Saved jobs should be selected by default and display saved jobs
    await expect(page.getByRole('tab', { name: /việc làm đã lưu/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });

    // Switch to Tab 2: Applied jobs
    const appliedTab = page.getByRole('tab', { name: /đã ứng tuyển/i });
    await expect(appliedTab).toBeVisible();
    await appliedTab.click();

    // Verify applied job post card is rendered
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });
  });
});
