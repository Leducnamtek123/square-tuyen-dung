import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupCandidateProfileApiMocks,
  setupCandidateDashboardKpiMocks,
  setupCandidateInterviewsApiMocks,
  setupCandidatePracticeApiMocks,
  setupCandidateSalaryApiMocks,
  setupCvBuilderApiMocks,
  MOCK_CANDIDATE_PROFILE,
  MOCK_JOBS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Candidate Dashboard & Navigation Traversal Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupCandidateDashboardKpiMocks(page);
    await setupCandidateInterviewsApiMocks(page);
    await setupCandidatePracticeApiMocks(page);
    await setupCandidateSalaryApiMocks(page);
    await setupCvBuilderApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: MOCK_CANDIDATE_PROFILE.id,
      email: MOCK_CANDIDATE_PROFILE.email,
      fullName: MOCK_CANDIDATE_PROFILE.fullName,
      isOnboarded: true,
    });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Suppress intrusive auto-start product tour during automation navigation
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_cv_builder', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_salary_benchmark', 'true');
      } catch {}
    });
  });

  test('Candidate Dashboard (/dashboard) displays Top 4 KPI metric cards', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Wait for the container to render
    const kpiBox = page.locator('[data-tour="candidate-kpi"]');
    await expect(kpiBox).toBeVisible({ timeout: 20_000 });

    // Verify presence of all 4 metric cards
    await expect(page.getByText(/việc làm đã nộp|việc làm đã ứng tuyển|đã ứng tuyển/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/việc làm đã lưu/i).first()).toBeVisible();
    await expect(page.getByText(/nhà tuyển dụng đã xem|lượt xem hồ sơ|ntd đã xem cv/i).first()).toBeVisible();
    await expect(page.getByText(/công ty đang theo dõi|công ty theo dõi|đang theo dõi/i).first()).toBeVisible();
  });

  test('Candidate Dashboard displays CV Score Card and Activity Chart Card', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // CV Score Card
    const cvScoreCard = page.locator('.gsap-candidate-row2').first();
    await expect(cvScoreCard).toBeVisible({ timeout: 20_000 });

    // Activity Chart Card
    const activityChart = page.locator('[data-tour="candidate-activity-chart"]').first();
    await expect(activityChart).toBeVisible({ timeout: 15_000 });
  });

  test('Candidate Dashboard displays AI Smart Job Recommendations and Recommended Jobs list', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // AI Smart Job Recommendations Section
    const aiJobsSection = page.locator('[data-tour="candidate-ai-jobs"]').first();
    await expect(aiJobsSection).toBeVisible({ timeout: 20_000 });

    // Recommended Jobs Card displaying mock jobs
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Candidate Dashboard offers an interactive Product Tour trigger', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const tourTrigger = page.getByRole('button', { name: /hướng dẫn bảng điều khiển|hướng dẫn/i }).first();
    await expect(tourTrigger).toBeVisible({ timeout: 20_000 });
  });

  test('Candidate Sidebar Navigation: Core Career Portals (Profile & My Jobs)', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });

    const nav = page.getByRole('navigation', { name: /điều hướng ứng viên/i });

    // 1. Hồ sơ của tôi (/profile -> /ho-so)
    const profileLink = nav.getByRole('link', { name: /hồ sơ của tôi/i }).first();
    await expect(profileLink).toBeVisible();
    await profileLink.click();
    await expect(page).toHaveURL(/\/(profile|ho-so)/, { timeout: 30_000 });
    await expect(
      page.getByText(MOCK_CANDIDATE_PROFILE.fullName).or(page.getByText('Ứng viên')).first()
    ).toBeVisible({ timeout: 20_000 });

    // 2. Quản lý việc làm (/my-jobs)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });
    const myJobsLink = nav.getByRole('link', { name: /quản lý việc làm/i }).first();
    await expect(myJobsLink).toBeVisible({ timeout: 20_000 });
    await myJobsLink.click();
    await expect(page).toHaveURL(/\/(my-jobs|viec-lam-cua-toi)/, { timeout: 30_000 });
    await expect(page.getByRole('tab', { name: /việc làm đã lưu/i })).toBeVisible({ timeout: 20_000 });
  });

  test('Candidate Sidebar Navigation: AI Voice & Interview Center (My Interviews & AI Practice Room)', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });

    const nav = page.getByRole('navigation', { name: /điều hướng ứng viên/i });

    // 1. Lịch phỏng vấn (/my-interviews)
    const myInterviewsLink = nav.getByRole('link', { name: /lịch phỏng vấn/i }).first();
    await expect(myInterviewsLink).toBeVisible({ timeout: 20_000 });
    await myInterviewsLink.click();
    await expect(page).toHaveURL(/\/(my-interviews|phong-van-cua-toi)/, { timeout: 30_000 });
    await expect(page.getByRole('tab', { name: /tất cả/i }).first()).toBeVisible({ timeout: 20_000 });

    // 2. Luyện phỏng vấn AI (/practice)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });
    const practiceLink = nav.getByRole('link', { name: /luyện phỏng vấn ai/i }).first();
    await expect(practiceLink).toBeVisible({ timeout: 20_000 });
    await practiceLink.click();
    await expect(page).toHaveURL(/\/(practice|luyen-phong-van|phong-van-thu)/, { timeout: 30_000 });
  });

  test('Candidate Sidebar Navigation: Tools & Account (CV Templates, Account Settings & Salary Benchmarks)', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });

    const nav = page.getByRole('navigation', { name: /điều hướng ứng viên/i });

    // 1. Trang trí CV (/ung-vien/trang-tri-cv)
    const cvTemplatesLink = nav.getByRole('link', { name: /trang trí cv/i }).first();
    await expect(cvTemplatesLink).toBeVisible({ timeout: 20_000 });
    await cvTemplatesLink.click();
    await expect(page).toHaveURL(/\/(ung-vien\/trang-tri-cv|trang-tri-cv)/, { timeout: 30_000 });

    // 2. Cài đặt tài khoản (/account)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });
    const accountLink = nav.getByRole('link', { name: /cài đặt tài khoản/i }).first();
    await expect(accountLink).toBeVisible({ timeout: 20_000 });
    await accountLink.click();
    await expect(page).toHaveURL(/\/(account|tai-khoan)/, { timeout: 30_000 });
    await expect(page.getByText(MOCK_CANDIDATE_PROFILE.email).first()).toBeVisible({ timeout: 20_000 });

    // 3. Tra cứu lương (/tra-cuu-luong)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-tour="candidate-kpi"]')).toBeVisible({ timeout: 20_000 });
    const salaryLink = nav.getByRole('link', { name: /tra cứu lương/i }).first();
    await expect(salaryLink).toBeVisible({ timeout: 20_000 });
    await salaryLink.click();
    await expect(page).toHaveURL(/\/(tra-cuu-luong|salary)/, { timeout: 30_000 });
    await expect(page.getByText(/cổng tra cứu dải lương chuẩn|dải lương chuẩn/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
