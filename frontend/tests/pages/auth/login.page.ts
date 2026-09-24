import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * LoginPage - Page Object Model cho các trang Đăng nhập hệ thống (Ứng viên, NTD, Admin)
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly alertError: Locator;
  readonly alertSuccess: Locator;
  readonly validationErrors: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly employerPortalLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"], input#email').first();
    this.passwordInput = page.locator('input[name="password"], input#password').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.alertError = page.locator('[role="alert"].MuiAlert-standardError, [role="alert"]').first();
    this.alertSuccess = page.locator('[role="alert"].MuiAlert-standardSuccess').first();
    this.validationErrors = page
      .locator('.Mui-error, [role="alert"]')
      .or(page.getByText(/bắt buộc|vui lòng nhập|không hợp lệ/i));
    this.forgotPasswordLink = page.locator('a[href*="forgot-password"], a[href*="quen-mat-khau"]').first();
    this.registerLink = page.locator('a[href*="register"], a[href*="dang-ky"]').first();
    this.employerPortalLink = page
      .locator('a[href*="/employer/login"], a[href*="/nha-tuyen-dung/login"]')
      .first();
  }

  /**
   * Điều hướng tới trang đăng nhập theo phân hệ
   */
  async goto(portalOrPath: 'candidate' | 'employer' | 'admin' | string = 'candidate') {
    const urls: Record<string, string> = {
      candidate: '/login',
      employer: '/employer/login',
      admin: '/admin/login',
    };
    const targetUrl = urls[portalOrPath] || (portalOrPath.startsWith('/') ? portalOrPath : `/${portalOrPath}`);
    await super.goto(targetUrl);
    await this.waitForLoadingGone();
  }

  /**
   * Điền email đăng nhập
   */
  async fillEmail(email: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.emailInput.fill(email);
  }

  /**
   * Điền mật khẩu đăng nhập
   */
  async fillPassword(password: string) {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.passwordInput.fill(password);
  }

  /**
   * Bấm nút gửi form đăng nhập
   */
  async submit() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.submitButton.click();
  }

  /**
   * Điền form và thực hiện đăng nhập
   */
  async login(email: string, password?: string) {
    await this.fillEmail(email);
    if (password !== undefined) {
      await this.fillPassword(password);
    }
    await this.submit();
  }

  /**
   * Kiểm tra thông báo lỗi đăng nhập (Alert/Toast)
   */
  async expectLoginError(message?: string | RegExp) {
    const alert = this.page.locator('[role="alert"]').or(this.page.locator('.MuiAlert-message')).first();
    await expect(alert).toBeVisible({ timeout: 10_000 });
    if (message) {
      await expect(alert).toContainText(message);
    }
    return alert;
  }

  /**
   * Kiểm tra thông báo validation lỗi input trống hoặc sai định dạng
   */
  async expectFieldValidationError(message?: string | RegExp) {
    const error = this.validationErrors.first();
    await expect(error).toBeVisible({ timeout: 5_000 });
    if (message) {
      await expect(error).toContainText(message);
    }
    return error;
  }

  /**
   * Xác nhận đăng nhập thành công qua URL chuyển hướng
   */
  async expectLoggedIn(targetUrlPattern: RegExp = /\/(dashboard|onboarding|employer|admin)?/) {
    await expect(this.page).toHaveURL(targetUrlPattern, { timeout: 15_000 });
  }
}
