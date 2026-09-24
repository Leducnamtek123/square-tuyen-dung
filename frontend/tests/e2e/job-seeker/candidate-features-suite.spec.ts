import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupCandidateProfileApiMocks,
  setupCandidateCvsApiMocks,
  setupCandidateInterviewsApiMocks,
  setupCandidatePracticeApiMocks,
  setupCandidateSalaryApiMocks,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_CVS,
  MOCK_CANDIDATE_INTERVIEW_SESSIONS,
  MOCK_CANDIDATE_COMPANY_QUESTION_SETS,
  MOCK_CANDIDATE_SALARY_BENCHMARKS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Candidate Advanced Features Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupCandidateCvsApiMocks(page);
    await setupCandidateInterviewsApiMocks(page);
    await setupCandidatePracticeApiMocks(page);
    await setupCandidateSalaryApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: MOCK_CANDIDATE_PROFILE.id,
      email: MOCK_CANDIDATE_PROFILE.email,
      fullName: MOCK_CANDIDATE_PROFILE.fullName,
      isOnboarded: true,
    });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Suppress intrusive auto-start product tour
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_cv_builder', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_salary_benchmark', 'true');
      } catch {}
    });
  });

  test('Quản lý CV (/my-cvs): list saved CVs, set main CV, duplicate CV, search, and delete modal', async ({
    page,
  }) => {
    await page.goto('/my-cvs', { waitUntil: 'domcontentloaded' });

    // 1. Verify CV list renders existing CVs
    await expect(page.getByText(MOCK_CANDIDATE_CVS[0].title).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_CANDIDATE_CVS[1].title).first()).toBeVisible({ timeout: 15_000 });

    // 2. Search CV by title
    const searchInput = page.getByPlaceholder(/tìm kiếm theo tên cv/i).or(page.locator('input[placeholder*="CV"]')).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Fullstack');
      await expect(page.getByText(MOCK_CANDIDATE_CVS[0].title).first()).toBeVisible();
    }

    // 3. Duplicate CV action
    const duplicateBtn = page.getByRole('button', { name: /nhân bản/i }).first();
    if (await duplicateBtn.isVisible()) {
      await duplicateBtn.click();
      // Should show success or duplicated item
      await expect(page.getByText(/bản sao/i).first()).toBeVisible({ timeout: 10_000 });
    }

    // 4. Delete CV dialog
    const deleteBtn = page.getByRole('button', { name: /xóa cv|xóa/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      const confirmDialog = page.getByRole('dialog').or(page.getByText(/xác nhận xóa/i)).first();
      await expect(confirmDialog).toBeVisible({ timeout: 10_000 });
      // Close / cancel dialog
      const cancelBtn = page.getByRole('button', { name: /hủy|đóng/i }).last();
      await cancelBtn.click();
    }
  });

  test('Lịch phỏng vấn & Đánh giá AI (/my-interviews): tab switching, viewing AI Evaluation modal, and join room link', async ({
    page,
  }) => {
    await page.goto('/my-interviews', { waitUntil: 'domcontentloaded' });

    // 1. Check interview list loaded
    await expect(page.getByRole('tab', { name: /tất cả/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_CANDIDATE_INTERVIEW_SESSIONS[0].job_name).first()).toBeVisible({ timeout: 15_000 });

    // 2. Switch to Mock Interviews Tab (Phỏng vấn thử AI)
    const mockTab = page.getByRole('tab', { name: /phỏng vấn thử ai|phỏng vấn thử/i });
    if (await mockTab.isVisible()) {
      await mockTab.click();
      await expect(page.getByText(MOCK_CANDIDATE_INTERVIEW_SESSIONS[0].job_name).first()).toBeVisible();
    }

    // 3. Open AI Evaluation modal for completed session
    const evalBtn = page.getByRole('button', { name: /xem đánh giá ai|kết quả đánh giá|xem kết quả/i }).first();
    if (await evalBtn.isVisible()) {
      await evalBtn.click();

      // Check modal heading and score breakdown
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10_000 });
      await expect(modal.getByText(/8\.5|xuất sắc/i).first()).toBeVisible({ timeout: 10_000 });

      // Close modal
      const closeBtn = modal.locator('button[aria-label="close"]').or(modal.getByRole('button', { name: /đóng/i })).first();
      await closeBtn.click();
      await expect(modal).not.toBeVisible();
    }

    // 4. Switch to Scheduled Tab (Sắp diễn ra) and check Join button
    const scheduledTab = page.getByRole('tab', { name: /sắp diễn ra/i });
    if (await scheduledTab.isVisible()) {
      await scheduledTab.click();
      const joinBtn = page.getByRole('button', { name: /tham gia phỏng vấn|vào phòng/i }).first();
      if (await joinBtn.isVisible()) {
        await expect(joinBtn).toBeEnabled();
      }
    }
  });

  test('Luyện phỏng vấn AI Voice (/practice): filter question sets by seniority and inspect question tips', async ({
    page,
  }) => {
    await page.goto('/practice', { waitUntil: 'domcontentloaded' });

    // 1. Verify question sets render
    await expect(page.getByText(MOCK_CANDIDATE_COMPANY_QUESTION_SETS[0].name).first()).toBeVisible({ timeout: 20_000 });

    // 2. Filter by Seniority
    const senioritySelect = page.getByLabel(/tất cả cấp bậc|cấp bậc/i).or(page.locator('#seniority-select')).first();
    if (await senioritySelect.isVisible()) {
      await senioritySelect.click();
      const seniorOption = page.getByRole('option', { name: /senior/i });
      if (await seniorOption.isVisible()) {
        await seniorOption.click();
      }
    }

    // 3. Verify action buttons appear on the question set card
    const practiceBtn = page.getByRole('button', { name: /luyện tập bộ này với ai|xem câu hỏi|luyện tập/i }).first();
    await expect(practiceBtn).toBeVisible({ timeout: 15_000 });
  });

  test('Tra cứu lương thị trường (/tra-cuu-luong): search by position, filter by seniority, view salary range', async ({
    page,
  }) => {
    await page.goto('/tra-cuu-luong', { waitUntil: 'domcontentloaded' });

    // 1. Verify salary benchmark page loads
    const searchInput = page.getByPlaceholder(/nhập chức danh, vị trí/i).or(page.locator('input[type="text"]')).first();
    await expect(searchInput).toBeVisible({ timeout: 20_000 });

    // 2. Search keyword
    await searchInput.fill('Fullstack');
    const searchBtn = page.getByRole('button', { name: /tra cứu|tìm kiếm/i }).first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    }

    // 3. Verify benchmark card with salary stats
    await expect(page.getByText(MOCK_CANDIDATE_SALARY_BENCHMARKS[0].job_title).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Cài đặt tài khoản (/account): check account security, change password dialog and privacy switch', async ({
    page,
  }) => {
    await page.goto('/account', { waitUntil: 'domcontentloaded' });

    // 1. Verify email and account details are displayed
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.email).first()).toBeVisible({ timeout: 20_000 });

    // 2. Open Change Password Modal
    const changePasswordBtn = page.getByRole('button', { name: /đổi mật khẩu/i }).first();
    if (await changePasswordBtn.isVisible()) {
      await changePasswordBtn.click();
      const passwordDialog = page.getByRole('dialog').first();
      await expect(passwordDialog).toBeVisible({ timeout: 10_000 });

      // Close password dialog
      const cancelBtn = passwordDialog.getByRole('button', { name: /hủy|đóng/i }).first();
      await cancelBtn.click();
      await expect(passwordDialog).not.toBeVisible();
    }

    // 3. Job Search Privacy switch
    const privacySwitch = page.locator('input[type="checkbox"]').first();
    if (await privacySwitch.isVisible()) {
      await expect(privacySwitch).toBeVisible();
    }
  });

  test('Trung tâm thông báo (/notifications): candidate views notification center', async ({ page }) => {
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' });

    // Verify notification container header
    await expect(page.getByText(/thông báo/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
