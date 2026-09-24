import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * ForgotPasswordPage - Page Object Model cho luồng Quên và Đặt lại mật khẩu (/forgot-password & /reset-password/[token])
 */
export class ForgotPasswordPage extends BasePage {
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successAlert: Locator;
  readonly errorAlert: Locator;
  readonly validationErrors: Locator;

  // Form đặt lại mật khẩu mới (/reset-password/[token])
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly resetSubmitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"], input#email').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.successAlert = page
      .locator('[role="alert"].MuiAlert-standardSuccess, [role="alert"]:has-text("thành công"), [role="alert"]:has-text("gửi")')
      .first();
    this.errorAlert = page
      .locator('[role="alert"].MuiAlert-standardError, [role="alert"]:has-text("lỗi"), [role="alert"]:has-text("hết hạn")')
      .first();
    this.validationErrors = page
      .locator('.Mui-error, [role="alert"]')
      .or(page.getByText(/bắt buộc|vui lòng nhập|không hợp lệ|không khớp/i));

    this.newPasswordInput = page.locator('input[name="newPassword"], input#newPassword').first();
    this.confirmPasswordInput = page
      .locator('input[name="confirmPassword"], input#confirmPassword')
      .first();
    this.resetSubmitButton = page.locator('button[type="submit"]').first();
  }

  /**
   * Điều hướng tới trang quên mật khẩu theo phân hệ
   */
  async goto(portalOrPath: 'candidate' | 'employer' | 'admin' | string = 'candidate') {
    const paths: Record<string, string> = {
      candidate: '/forgot-password',
      employer: '/employer/forgot-password',
      admin: '/admin/forgot-password',
    };
    const targetUrl = paths[portalOrPath] || (portalOrPath.startsWith('/') ? portalOrPath : `/${portalOrPath}`);
    await super.goto(targetUrl);
    await this.waitForLoadingGone();
  }

  /**
   * Gửi yêu cầu link đặt lại mật khẩu
   */
  async requestResetLink(email: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Kiểm tra thông báo email đã được gửi thành công
   */
  async expectResetLinkSent(message?: string | RegExp) {
    const alert = this.page.locator('[role="alert"]').first();
    await expect(alert).toBeVisible({ timeout: 10_000 });
    if (message) {
      await expect(alert).toContainText(message);
    }
    return alert;
  }

  /**
   * Điều hướng trực tiếp tới trang đặt lại mật khẩu với token
   */
  async gotoResetPassword(token: string) {
    await super.goto(`/reset-password/${token}`);
    await this.waitForLoadingGone();
  }

  /**
   * Điền mật khẩu mới và xác nhận mật khẩu
   */
  async fillResetPassword(newPass: string, confirmPass?: string) {
    await this.newPasswordInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.newPasswordInput.fill(newPass);
    if (confirmPass !== undefined) {
      await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confirmPasswordInput.fill(confirmPass);
    }
  }

  /**
   * Bấm submit đặt lại mật khẩu mới
   */
  async submitResetPassword() {
    await this.resetSubmitButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.resetSubmitButton.click();
  }

  /**
   * Toàn trình đặt lại mật khẩu với token
   */
  async resetPassword(token: string, newPass: string, confirmPass?: string) {
    await this.gotoResetPassword(token);
    await this.fillResetPassword(newPass, confirmPass ?? newPass);
    await this.submitResetPassword();
  }

  /**
   * Xác nhận đặt lại mật khẩu thành công (chuyển hướng về trang đăng nhập)
   */
  async expectResetPasswordSuccess() {
    await expect(this.page).toHaveURL(/login.*passwordResetSuccess|login/i, { timeout: 15_000 });
  }

  /**
   * Kiểm tra thông báo lỗi khi token hết hạn hoặc không hợp lệ
   */
  async expectResetError(message?: string | RegExp) {
    const alert = this.page.locator('[role="alert"]').first();
    await expect(alert).toBeVisible({ timeout: 10_000 });
    if (message) {
      await expect(alert).toContainText(message);
    }
    return alert;
  }
}
