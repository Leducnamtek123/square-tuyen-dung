import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupOnboardingApiMocks,
  setupEmployerApiMocks,
} from '../../helpers/mockApi';
import { injectSession, NON_ONBOARDED_EMPLOYER } from '../../helpers/auth';

test.describe('Employer Onboarding Flow (/onboarding/employer)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupEmployerApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      isOnboarded: false,
      fullName: 'Tran Thi Tuyen Dung',
      email: 'employer.new@infohr.vn',
      companyId: 10,
      companyName: 'InfoHR Test Corp',
    });
    await setupOnboardingApiMocks(page);
    await injectSession(context, NON_ONBOARDED_EMPLOYER);
  });

  test('Tax Code Lookup: queries VietQR API and auto-populates company name and address', async ({
    page,
  }) => {
    await page.goto('/onboarding/employer');

    // Verify Step 1 is active
    await expect(
      page.getByText('Thông tin Thương hiệu Doanh nghiệp')
    ).toBeVisible({ timeout: 20_000 });

    const taxInput = page.getByPlaceholder('VD: 0101234567');
    await expect(taxInput).toBeVisible();

    // Input fresh tax code
    await taxInput.fill('0109876543');

    // Click 'Tra cứu MST' button
    const lookupButton = page.getByRole('button', { name: /Tra cứu MST/i });
    await expect(lookupButton).toBeVisible();
    await lookupButton.click();

    // Verify auto-fill success notice
    await expect(
      page.getByText(/Đã tra cứu & điền tự động: CÔNG TY TNHH CÔNG NGHỆ E2E TEST/i)
    ).toBeVisible({ timeout: 10_000 });

    // Verify Company Name input is filled
    const companyNameInput = page.getByPlaceholder(/Công ty Cổ phần Công nghệ/i);
    await expect(companyNameInput).toHaveValue('CÔNG TY TNHH CÔNG NGHỆ E2E TEST');
  });

  test('Duplicate Tax Code: displays Join Request card with company name and request button', async ({
    page,
  }) => {
    await page.goto('/onboarding/employer');

    await expect(
      page.getByText('Thông tin Thương hiệu Doanh nghiệp')
    ).toBeVisible({ timeout: 20_000 });

    const taxInput = page.getByPlaceholder('VD: 0101234567');
    await taxInput.fill('0100000000_DUPLICATE');

    const lookupButton = page.getByRole('button', { name: /Tra cứu MST/i });
    await lookupButton.click();

    // Verify duplicate company card
    await expect(
      page.getByText(/Doanh nghiệp này đã có tài khoản trên InfoHR/i)
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/Tập đoàn Công nghệ Đã Tồn Tại/i)
    ).toBeVisible();

    // Verify Join Request button
    const joinButton = page.getByRole('button', { name: /Gửi yêu cầu tham gia/i });
    await expect(joinButton).toBeVisible();

    // Click to send join request
    await joinButton.click();

    // Verify redirect to employer dashboard
    await page.waitForURL('**/employer/dashboard', { timeout: 15_000 });
    expect(page.url()).toContain('/employer/dashboard');
  });

  test("Skip button ('Thiết lập sau'): redirects to /employer/dashboard and shows OnboardingProgressBanner", async ({
    page,
  }) => {
    await page.goto('/onboarding/employer');

    const skipButton = page.getByRole('button', { name: /Thiết lập sau/i });
    await expect(skipButton).toBeVisible({ timeout: 20_000 });
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/onboarding/skip')),
      skipButton.click(),
    ]);

    // Verify redirect to /employer/dashboard
    await page.waitForURL('**/employer/dashboard', { timeout: 15_000 });
    expect(page.url()).toContain('/employer/dashboard');

    // Verify OnboardingProgressBanner for employer is rendered
    const banner = page.getByText(/Hồ sơ doanh nghiệp hoàn thiện/i);
    await expect(banner).toBeVisible({ timeout: 15_000 });
  });

  test('Full Employer Onboarding flow: Step 1, Step 2, Step 3 (GPKD) to Step 4 (Completion screen with invite colleagues)', async ({
    page,
  }) => {
    await page.goto('/onboarding/employer');

    // Step 1: Fill Company Details
    await expect(
      page.getByText('Thông tin Thương hiệu Doanh nghiệp')
    ).toBeVisible({ timeout: 20_000 });

    await page
      .getByPlaceholder(/Công ty Cổ phần Công nghệ/i)
      .fill('CÔNG TY TNHH CÔNG NGHỆ E2E TEST');

    const cityInput = page.getByPlaceholder('Chọn Tỉnh / Thành phố...');
    await cityInput.click();
    await page.getByRole('option', { name: 'Hà Nội' }).click();

    await page.getByRole('button', { name: 'Tiếp theo' }).click();

    // Step 2: Recruiter Profile
    await expect(
      page.getByText('Thông tin Đại diện Tuyển dụng')
    ).toBeVisible({ timeout: 10_000 });

    const recruiterNameInput = page.getByPlaceholder('VD: Nguyễn Văn A');
    await recruiterNameInput.fill('Tran Thi Tuyen Dung');

    const recruiterPhoneInput = page.getByPlaceholder('VD: 0912345678');
    await recruiterPhoneInput.fill('0901234567');

    await page.getByRole('button', { name: 'Tiếp theo' }).click();

    // Step 3: GPKD Verification (Skip or Submit)
    await expect(
      page.getByText(/Xác thực Doanh nghiệp \(GPKD\)|Xác thực.*GPKD/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const skipVerificationBtn = page.getByRole('button', {
      name: /Bỏ qua & Xác thực sau/i,
    });
    await expect(skipVerificationBtn).toBeVisible();
    await skipVerificationBtn.click();

    // Step 4: Completion screen
    await expect(
      page.getByText('Chào mừng bạn gia nhập InfoHR!')
    ).toBeVisible({ timeout: 15_000 });

    // Verify Invite Colleagues section & button
    await expect(
      page.getByText('Mời thành viên phòng HR / Tuyển dụng cùng làm việc')
    ).toBeVisible();

    const inviteColleagueButton = page.getByRole('link', { name: /Mời đồng nghiệp/i });
    await expect(inviteColleagueButton).toBeVisible();
    await expect(inviteColleagueButton).toHaveAttribute('href', '/employer/hrm/team');
  });
});
