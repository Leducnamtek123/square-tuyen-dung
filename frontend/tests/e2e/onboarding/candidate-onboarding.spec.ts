import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupOnboardingApiMocks,
} from '../../helpers/mockApi';
import { injectSession, NON_ONBOARDED_CANDIDATE } from '../../helpers/auth';

test.describe('Candidate Onboarding Flow (/onboarding/candidate)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      isOnboarded: false,
      fullName: 'Nguyen Van Ung Vien',
      email: 'candidate.new@infohr.vn',
    });
    await setupOnboardingApiMocks(page);
    await injectSession(context, NON_ONBOARDED_CANDIDATE);
  });

  test('Step 1: Contact phone field on real browser, desired job title, industry, and city', async ({
    page,
  }) => {
    await page.goto('/onboarding/candidate');

    // Verify page header and Step 1 title
    await expect(
      page.getByText('Mục tiêu & Nguyện vọng nghề nghiệp')
    ).toBeVisible({ timeout: 20_000 });

    // 1. Phone Input test: Type '0987654321', clear, re-type, verify DOM value
    const phoneInput = page.getByPlaceholder('VD: 0912345678');
    await expect(phoneInput).toBeVisible();

    await phoneInput.fill('0987654321');
    await expect(phoneInput).toHaveValue('0987654321');

    await phoneInput.clear();
    await expect(phoneInput).toHaveValue('');

    await phoneInput.fill('0987654321');
    await expect(phoneInput).toHaveValue('0987654321');

    // 2. Desired Job Title input
    const jobTitleInput = page.getByPlaceholder(/Chuyên viên Marketing, Kỹ sư phần mềm/i);
    await expect(jobTitleInput).toBeVisible();
    await jobTitleInput.fill('Kỹ sư phần mềm Fullstack');
    await expect(jobTitleInput).toHaveValue('Kỹ sư phần mềm Fullstack');

    // 3. Career / Industry Autocomplete
    const careerInput = page.getByPlaceholder('Chọn ngành nghề chuyên môn...');
    await expect(careerInput).toBeVisible();
    await careerInput.click();
    await page.getByRole('option', { name: 'Công nghệ thông tin / Phần mềm' }).click();

    // 4. City Autocomplete
    const cityInput = page.getByPlaceholder('Chọn Tỉnh / Thành phố...');
    await expect(cityInput).toBeVisible();
    await cityInput.click();
    await page.getByRole('option', { name: 'Hà Nội' }).click();

    // 5. Workplace type button
    const remoteButton = page.getByRole('button', { name: /Làm việc từ xa|Từ xa/i });
    await expect(remoteButton).toBeVisible();
    await remoteButton.click();

    // 6. Click 'Tiếp theo' to transition to Step 2
    const nextButton = page.getByRole('button', { name: 'Tiếp theo' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Verify successful progression to Step 2
    await expect(
      page.getByText('Kỹ năng & Kinh nghiệm làm việc')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('CV-First Auto-parse dropzone: auto-extracts candidate details from uploaded CV', async ({
    page,
  }) => {
    await page.goto('/onboarding/candidate');

    // Check presence of CV-First AI Fast Track banner
    await expect(
      page.getByText(/Tải CV lên — AI tự động trích xuất/i)
    ).toBeVisible({ timeout: 20_000 });

    const autoParseButton = page.getByRole('button', { name: /Tải CV tự động điền/i });
    await expect(autoParseButton).toBeVisible();

    // Upload mock PDF resume
    const fileInput = page.locator('input[type="file"][accept*=".pdf"]');
    await fileInput.setInputFiles({
      name: 'Nguyen_Van_A_CV.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Mock CV Content'),
    });

    // Verify CV-First banner transitions to parsed state
    await expect(
      page.getByText(/Đã đính kèm CV: Nguyen_Van_A_CV.pdf/i)
    ).toBeVisible({ timeout: 15_000 });

    // Verify form fields were auto-populated by AI parse
    const jobTitleInput = page.getByPlaceholder(/Chuyên viên Marketing, Kỹ sư phần mềm/i);
    await expect(jobTitleInput).toHaveValue('Kỹ sư phần mềm Fullstack');

    const phoneInput = page.getByPlaceholder('VD: 0912345678');
    await expect(phoneInput).toHaveValue('0987654321');
  });

  test("Skip button ('Thiết lập sau'): redirects to /jobs and displays OnboardingProgressBanner", async ({
    page,
  }) => {
    await page.goto('/onboarding/candidate');

    // Click 'Thiết lập sau' in header
    const skipButton = page.getByRole('button', { name: /Thiết lập sau/i });
    await expect(skipButton).toBeVisible({ timeout: 20_000 });

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/onboarding/skip')),
      skipButton.click(),
    ]);

    // Verify redirection to /jobs
    await page.waitForURL('**/jobs', { timeout: 15_000 });
    expect(page.url()).toContain('/jobs');

    // Verify OnboardingProgressBanner appears for un-onboarded candidate
    const banner = page.getByText(/Hồ sơ tìm việc hoàn thiện/i);
    await expect(banner).toBeVisible({ timeout: 15_000 });

    // Verify banner CTA button to complete profile
    const bannerCta = page.getByRole('link', { name: /Hoàn tất hồ sơ ngay|Tiếp tục thiết lập|Hoàn tất ngay/i });
    await expect(bannerCta).toBeVisible();
    await expect(bannerCta).toHaveAttribute('href', '/onboarding/candidate');
  });

  test('Step 2 (Skills & Experience), Step 3 (Resume Upload), and Step 4 (Completion screen with AILA Voice AI card)', async ({
    page,
  }) => {
    await page.goto('/onboarding/candidate');

    // Step 1: Fill required fields and proceed
    await page.getByPlaceholder(/Chuyên viên Marketing, Kỹ sư phần mềm/i).fill('Frontend Developer');
    await page.getByPlaceholder('VD: 0912345678').fill('0987654321');
    const careerInput = page.getByPlaceholder('Chọn ngành nghề chuyên môn...');
    await careerInput.click();
    await page.getByRole('option', { name: 'Công nghệ thông tin / Phần mềm' }).click();
    const cityInput = page.getByPlaceholder('Chọn Tỉnh / Thành phố...');
    await cityInput.click();
    await page.getByRole('option', { name: 'Hà Nội' }).click();

    await page.getByRole('button', { name: 'Tiếp theo' }).click();

    // Step 2: Skills & Experience
    await expect(
      page.getByText('Kỹ năng & Kinh nghiệm làm việc')
    ).toBeVisible({ timeout: 10_000 });

    // Add custom skill
    const skillInput = page.getByPlaceholder(/kỹ năng/i);
    await skillInput.fill('React');
    await page.getByRole('button', { name: 'Thêm' }).click();
    await expect(page.getByText('React').first()).toBeVisible();

    // Add another skill
    await skillInput.fill('TypeScript');
    await page.getByRole('button', { name: 'Thêm' }).click();
    await expect(page.getByText('TypeScript').first()).toBeVisible();

    // Select salary quick range
    const salaryRangeBtn = page.getByRole('button', { name: '15 - 25 triệu' });
    await expect(salaryRangeBtn).toBeVisible();
    await salaryRangeBtn.click();

    // Proceed to Step 3
    await page.getByRole('button', { name: 'Tiếp theo' }).click();

    // Step 3: Resume Upload
    await expect(
      page.getByText(/Tải CV hoặc Tạo hồ sơ nhanh|Tải CV/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const cvDropzoneInput = page.locator('input[type="file"][accept*=".pdf"]');
    await cvDropzoneInput.setInputFiles({
      name: 'Frontend_CV.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Resume Data'),
    });
    await expect(page.getByText('Frontend_CV.pdf')).toBeVisible({ timeout: 10_000 });

    // Click 'Hoàn tất hồ sơ cơ bản'
    const completeButton = page.getByRole('button', { name: /Hoàn tất hồ sơ cơ bản/i });
    await expect(completeButton).toBeVisible();
    await completeButton.click();

    // Step 4: Completion Screen
    await expect(
      page.getByText(/Hồ sơ của bạn đã sẵn sàng|Tuyệt vời! Bạn đã sẵn sàng/i)
    ).toBeVisible({ timeout: 15_000 });

    // Verify AILA AI Voice Interview Launchpad card
    await expect(
      page.getByText('Luyện phỏng vấn thử với AI Voice (AILA)')
    ).toBeVisible();
    await expect(
      page.getByText(/Thực hành trả lời câu hỏi chuyên môn thời gian thực với trợ lý AI AILA/i)
    ).toBeVisible();

    const ailaButton = page.getByRole('link', { name: /Thử phỏng vấn 5 phút/i });
    await expect(ailaButton).toBeVisible();
    await expect(ailaButton).toHaveAttribute('href', /\/interview\?jobTitle=/);
  });
});
