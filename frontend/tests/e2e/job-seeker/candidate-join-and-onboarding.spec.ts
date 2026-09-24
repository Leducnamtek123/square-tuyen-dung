import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupOnboardingApiMocks,
  setupCandidateProfileApiMocks,
  setupCandidateRegisterApiMocks,
} from '../../helpers/mockApi';
import { injectSession, NON_ONBOARDED_CANDIDATE } from '../../helpers/auth';

test.describe('Candidate Join & Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupCandidateRegisterApiMocks(page);
  });

  test('New candidate can fill and submit registration form on /register', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });

    // Wait for the signup form to render (allowing sufficient time for initial Next.js compilation)
    const nameInput = page.locator('input[name="fullName"]').first();
    await expect(nameInput).toBeVisible({ timeout: 45_000 });

    const emailInput = page.locator('input[name="email"]').first();
    const passwordInput = page.locator('#password').or(page.getByPlaceholder('Nhập mật khẩu của bạn')).first();
    const confirmPasswordInput = page.locator('#confirmPassword').or(page.getByPlaceholder('Nhập lại mật khẩu')).first();

    // Fill registration credentials with compliant password
    await nameInput.fill('Nguyen Van Ung Vien Moi');
    await emailInput.fill('ungvien.moi@infohr.vn');
    await passwordInput.fill('SecureP@ss123!');
    await confirmPasswordInput.fill('SecureP@ss123!');

    // Submit registration
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/job-seeker/register')),
      submitBtn.click(),
    ]);

    // Redirection or verification notice should be reached
    await expect(page).toHaveURL(/\/(email-verification-required|onboarding|login)/, { timeout: 30_000 });
  });

  test('Non-onboarded candidate logs in and gets automatically redirected to /onboarding/candidate', async ({
    page,
    context,
  }) => {
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: false,
      fullName: 'Ung Vien Chua Onboard',
      email: 'candidate.new@infohr.vn',
    });
    await setupOnboardingApiMocks(page);
    await injectSession(context, NON_ONBOARDED_CANDIDATE);

    // Attempt to access candidate dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // JobSeekerLayout detects isOnboarded === false and redirects to onboarding
    await expect(page).toHaveURL(/\/onboarding\/candidate/, { timeout: 60_000 });

    await expect(page.getByText(/Mục tiêu & Nguyện vọng nghề nghiệp/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test('CV-First AI Fast-track: auto-extracts candidate details from uploaded CV on /onboarding/candidate', async ({
    page,
    context,
  }) => {
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: false,
      fullName: 'Nguyen Van Ung Vien',
      email: 'candidate.new@infohr.vn',
    });
    await setupOnboardingApiMocks(page);
    await injectSession(context, NON_ONBOARDED_CANDIDATE);

    await page.goto('/onboarding/candidate', { waitUntil: 'domcontentloaded' });

    // Verify AI Fast-track dropzone banner (allow 60s for Next.js webpack compilation)
    await expect(page.getByText(/Tải CV lên — AI tự động trích xuất/i)).toBeVisible({
      timeout: 60_000,
    });

    const fileInput = page.locator('input[type="file"][accept*=".pdf"]');
    await fileInput.setInputFiles({
      name: 'CV_Nguyen_Van_A.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Mock Candidate CV Content'),
    });

    // Verify auto-fill transition
    await expect(page.getByText(/Đã đính kèm CV: CV_Nguyen_Van_A.pdf/i)).toBeVisible({
      timeout: 15_000,
    });

    const jobTitleInput = page.getByPlaceholder(/Chuyên viên Marketing, Kỹ sư phần mềm/i);
    await expect(jobTitleInput).toHaveValue('Kỹ sư phần mềm Fullstack');
  });

  test('Complete 4-Step Onboarding Journey culminating in completion screen with AILA Voice AI', async ({
    page,
    context,
  }) => {
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: false,
      fullName: 'Nguyen Van Ung Vien',
      email: 'candidate.new@infohr.vn',
    });
    await setupOnboardingApiMocks(page);
    await injectSession(context, NON_ONBOARDED_CANDIDATE);

    await page.goto('/onboarding/candidate', { waitUntil: 'domcontentloaded' });

    // Step 1: Career preferences & contact
    await page.getByPlaceholder(/Chuyên viên Marketing, Kỹ sư phần mềm/i).fill('Lead Frontend Engineer');
    await page.getByPlaceholder('VD: 0912345678').fill('0901234567');

    const careerInput = page.getByPlaceholder('Chọn ngành nghề chuyên môn...');
    await careerInput.click();
    await page.getByRole('option', { name: 'Công nghệ thông tin / Phần mềm' }).click();

    const cityInput = page.getByPlaceholder('Chọn Tỉnh / Thành phố...');
    await cityInput.click();
    await page.getByRole('option', { name: 'Hà Nội' }).click();

    await page.getByRole('button', { name: 'Tiếp theo' }).click();

    // Step 2: Skills & Experience
    await expect(page.getByText('Kỹ năng & Kinh nghiệm làm việc')).toBeVisible({ timeout: 15_000 });

    const skillInput = page.getByPlaceholder(/kỹ năng/i);
    await skillInput.fill('Next.js');
    await page.getByRole('button', { name: 'Thêm' }).click();
    await expect(page.getByText('Next.js').first()).toBeVisible();

    const salaryQuickBtn = page.getByRole('button', { name: '25 - 35 triệu' }).or(page.getByRole('button', { name: '15 - 25 triệu' })).first();
    await salaryQuickBtn.click();

    await page.getByRole('button', { name: 'Tiếp theo' }).click();

    // Step 3: Attach CV / Upload
    await expect(page.getByText(/Tải CV hoặc Tạo hồ sơ nhanh|Tải CV/i).first()).toBeVisible({ timeout: 15_000 });

    const resumeDropzone = page.locator('input[type="file"][accept*=".pdf"]');
    await resumeDropzone.setInputFiles({
      name: 'Lead_Frontend_CV.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Mock CV Buffer'),
    });
    await expect(page.getByText('Lead_Frontend_CV.pdf')).toBeVisible({ timeout: 15_000 });

    // Complete onboarding
    const finishBtn = page.getByRole('button', { name: /Hoàn tất hồ sơ cơ bản/i });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // Step 4: Completion Screen with AILA Voice AI Launchpad
    await expect(page.getByText(/Hồ sơ của bạn đã sẵn sàng|Tuyệt vời! Bạn đã sẵn sàng/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText('Luyện phỏng vấn thử với AI Voice (AILA)')).toBeVisible();

    const practiceLink = page.getByRole('link', { name: /Thử phỏng vấn 5 phút/i });
    await expect(practiceLink).toBeVisible();
    await expect(practiceLink).toHaveAttribute('href', /\/(luyen-phong-van|practice)\?jobTitle=/);
  });

  test('Candidate can skip onboarding ("Thiết lập sau") and see OnboardingProgressBanner on /jobs', async ({
    page,
    context,
  }) => {
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: false,
      fullName: 'Nguyen Van Ung Vien',
      email: 'candidate.new@infohr.vn',
    });
    await setupOnboardingApiMocks(page);
    await injectSession(context, NON_ONBOARDED_CANDIDATE);

    await page.goto('/onboarding/candidate', { waitUntil: 'domcontentloaded' });

    const skipBtn = page.getByRole('button', { name: /Thiết lập sau/i });
    await expect(skipBtn).toBeVisible({ timeout: 20_000 });

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/onboarding/skip')),
      skipBtn.click(),
    ]);

    await page.waitForURL('**/jobs', { timeout: 30_000 });
    expect(page.url()).toContain('/jobs');

    // OnboardingProgressBanner is present and allows resuming onboarding
    const banner = page.getByText(/Hồ sơ tìm việc hoàn thiện/i);
    await expect(banner).toBeVisible({ timeout: 20_000 });

    const completeNowBtn = page.getByRole('link', { name: /Hoàn tất hồ sơ ngay|Tiếp tục thiết lập|Hoàn tất ngay/i });
    await expect(completeNowBtn).toBeVisible();
    await expect(completeNowBtn).toHaveAttribute('href', '/onboarding/candidate');
  });
});
