import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupAuthApiMocks } from '../../helpers/mockApi';
import { submitLoginForm } from '../../helpers/auth';

test.describe('Authentication & Authorization E2E', () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonApiMocks(page);
  });

  test('Candidate login page renders properly and validates empty input', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[name="email"], input#email').first();
    const passwordInput = page.locator('input[name="password"], input#password').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });
    await expect(submitBtn).toBeVisible();

    // Submit with empty inputs
    await submitBtn.click();

    // Check validation message or error state
    await expect(
      page.locator('.Mui-error, [role="alert"]').or(page.getByText(/bắt buộc|vui lòng nhập/i)).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Candidate login shows error on invalid credentials', async ({ page }) => {
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });

    await page.goto('/login');
    await submitLoginForm(page, {
      email: 'wrong.candidate@infohr.vn',
      password: 'WrongPassword!',
    });

    // Alert or toast error should appear
    await expect(
      page.locator('[role="alert"]').or(page.getByText(/không chính xác|thất bại|lỗi/i)).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Candidate login successfully with valid credentials', async ({ page }) => {
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      email: 'candidate.success@infohr.vn',
      fullName: 'Nguyen Van Ung Vien',
    });

    await page.goto('/login');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/token/') && res.status() === 200),
      submitLoginForm(page, {
        email: 'candidate.success@infohr.vn',
        password: 'CorrectPassword123!',
      }),
    ]);

    expect(response.status()).toBe(200);
  });

  test('Employer login form renders on /employer/login', async ({ page }) => {
    await setupAuthApiMocks(page, { role: 'EMPLOYER' });
    await page.goto('/employer/login');

    const emailInput = page.locator('input[name="email"], input#email').first();
    const passwordInput = page.locator('input[name="password"], input#password').first();

    await expect(emailInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });
  });

  test('Route Guard redirects unauthenticated user away from protected employer dashboard', async ({ page }) => {
    // Navigate without cookies/session
    await page.goto('/employer/dashboard');

    // Should redirect to employer login or display login prompt
    await expect(page).toHaveURL(/\/employer\/login|\/login/, { timeout: 15_000 });
  });
});
