import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * RegisterPage - Page Object Model cho trang Đăng ký tài khoản Ứng viên (/register)
 */
export class RegisterPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly alertError: Locator;
  readonly validationErrors: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.locator('input[name="fullName"], input#fullName').first();
    this.emailInput = page.locator('input[name="email"], input#email').first();
    this.passwordInput = page.locator('input[name="password"], input#password').first();
    this.confirmPasswordInput = page
      .locator('input[name="confirmPassword"], input#confirmPassword')
      .first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.alertError = page.locator('[role="alert"]').first();
    this.validationErrors = page
      .locator('.Mui-error, [role="alert"]')
      .or(page.getByText(/bắt buộc|vui lòng nhập|không khớp|ít nhất|hợp lệ/i));
    this.loginLink = page.locator('a[href*="login"], a[href*="dang-nhap"]').first();
  }

  /**
   * Điều hướng tới trang đăng ký ứng viên
   */
  async goto() {
    await super.goto('/register');
    await this.waitForLoadingGone();
  }

  /**
   * Điền thông tin vào form đăng ký ứng viên
   */
  async fillCandidateRegisterForm(data: {
    fullName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
  }) {
    await this.fullNameInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.fullNameInput.fill(data.fullName);

    await this.emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.emailInput.fill(data.email);

    if (data.password !== undefined) {
      await this.passwordInput.waitFor({ state: 'visible', timeout: 15_000 });
      await this.passwordInput.fill(data.password);
    }

    if (data.confirmPassword !== undefined) {
      await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confirmPasswordInput.fill(data.confirmPassword);
    }
  }

  /**
   * Bấm nút gửi form đăng ký
   */
  async submit() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.submitButton.click();
  }

  /**
   * Kiểm tra xuất hiện lỗi validation trường thông tin
   */
  async expectValidationError(message?: string | RegExp) {
    const error = this.validationErrors.first();
    await expect(error).toBeVisible({ timeout: 7_000 });
    if (message) {
      await expect(error).toContainText(message);
    }
    return error;
  }

  /**
   * Kiểm tra thông báo lỗi khi đăng ký bằng email đã tồn tại
   */
  async expectDuplicateEmailError(message?: string | RegExp) {
    const alert = this.page.locator('[role="alert"]').or(this.page.locator('.Mui-error')).first();
    await expect(alert).toBeVisible({ timeout: 10_000 });
    if (message) {
      await expect(alert).toContainText(message);
    }
    return alert;
  }

  /**
   * Xác nhận đăng ký thành công và chuyển hướng đến trang xác thực hoặc trang chủ
   */
  async expectRegistrationSuccess(targetUrlPattern: RegExp = /\/(email-verification-required|onboarding|xac-nhan-email|$)/) {
    await expect(this.page).toHaveURL(targetUrlPattern, { timeout: 15_000 });
  }
}
