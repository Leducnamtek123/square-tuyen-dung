import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../../pages/auth/forgot-password.page';
import { setupAllApiMocks } from '../../mocks/index';
import { setupDomainAuthMocks } from '../../mocks/mock-auth';

test.describe('Phân hệ 01-Auth: Khôi phục & Đặt lại mật khẩu (AUTH-05, AUTH-06)', () => {
  let recoveryPage: ForgotPasswordPage;

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainAuthMocks(page);
    recoveryPage = new ForgotPasswordPage(page);
  });

  test('AUTH-05: Gửi yêu cầu đặt lại mật khẩu thành công qua email', async ({ page }) => {
    await recoveryPage.goto('candidate');

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/auth/forgot-password/') && res.status() === 200
      ),
      recoveryPage.requestResetLink('candidate.reset@infohr.vn'),
    ]);

    expect(response.status()).toBe(200);
    await recoveryPage.expectResetLinkSent(/liên kết|email|thành công/i);
  });

  test('AUTH-05 Negative: Nhập sai định dạng email hiển thị lỗi validation', async () => {
    await recoveryPage.goto('candidate');
    await recoveryPage.requestResetLink('invalid-email-format');
    await recoveryPage.validationErrors.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(recoveryPage.validationErrors.first()).toBeVisible();
  });

  test('AUTH-06: Đặt lại mật khẩu mới thành công với token hợp lệ', async ({ page }) => {
    const validToken = 'valid-reset-token-xyz-123';
    await recoveryPage.gotoResetPassword(validToken);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/auth/reset-password/') && res.status() === 200
      ),
      recoveryPage.fillResetPassword('NewSecurePassword123!', 'NewSecurePassword123!').then(() =>
        recoveryPage.submitResetPassword()
      ),
    ]);

    expect(response.status()).toBe(200);
    await recoveryPage.expectResetPasswordSuccess();
  });

  test('AUTH-06 Negative: Mật khẩu xác nhận không khớp trong form đặt lại', async () => {
    await recoveryPage.gotoResetPassword('test-token-mismatch');
    await recoveryPage.fillResetPassword('NewSecurePassword123!', 'MismatchPassword456!');
    await recoveryPage.submitResetPassword();

    await recoveryPage.validationErrors.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(recoveryPage.validationErrors.first()).toContainText(/không khớp/i);
  });

  test('AUTH-06 Negative: Token hết hạn hoặc không hợp lệ hiển thị thông báo lỗi', async ({ page }) => {
    await recoveryPage.gotoResetPassword('expired-token');

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/auth/reset-password/') && res.status() === 400
      ),
      recoveryPage.fillResetPassword('NewSecurePassword123!', 'NewSecurePassword123!').then(() =>
        recoveryPage.submitResetPassword()
      ),
    ]);

    expect(response.status()).toBe(400);
    await recoveryPage.expectResetError(/hết hạn|lỗi/i);
  });
});
