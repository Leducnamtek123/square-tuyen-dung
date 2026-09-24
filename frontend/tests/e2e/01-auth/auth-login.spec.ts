import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { setupAllApiMocks } from '../../mocks/index';
import { setupDomainAuthMocks } from '../../mocks/mock-auth';
import {
  injectSession,
  DEFAULT_CANDIDATE,
  DEFAULT_EMPLOYER,
  DEFAULT_ADMIN,
} from '../../helpers/auth';

test.describe('Phân hệ 01-Auth: Đăng nhập & Quản lý phiên (AUTH-02, AUTH-07, AUTH-09)', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    loginPage = new LoginPage(page);
  });

  test('AUTH-02: Ứng viên đăng nhập thành công với thông tin hợp lệ', async ({ page }) => {
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: DEFAULT_CANDIDATE.email,
      fullName: DEFAULT_CANDIDATE.fullName,
    });

    await loginPage.goto('candidate');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/token/') && res.status() === 200),
      loginPage.login(DEFAULT_CANDIDATE.email!, 'ValidPassword123!'),
    ]);

    expect(response.status()).toBe(200);
  });

  test('AUTH-02: Nhà tuyển dụng đăng nhập thành công với thông tin hợp lệ', async ({ page }) => {
    await setupDomainAuthMocks(page, {
      role: 'EMPLOYER',
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });

    await loginPage.goto('employer');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/token/') && res.status() === 200),
      loginPage.login(DEFAULT_EMPLOYER.email!, 'ValidPassword123!'),
    ]);

    expect(response.status()).toBe(200);
  });

  test('AUTH-02: Quản trị viên (Admin) đăng nhập thành công', async ({ page }) => {
    await setupDomainAuthMocks(page, {
      role: 'ADMIN',
      email: DEFAULT_ADMIN.email,
      fullName: DEFAULT_ADMIN.fullName,
    });

    await loginPage.goto('admin');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/token/') && res.status() === 200),
      loginPage.login(DEFAULT_ADMIN.email!, 'ValidPassword123!'),
    ]);

    expect(response.status()).toBe(200);
  });

  test('AUTH-02 Negative: Đăng nhập với form rỗng hiển thị lỗi validation', async () => {
    await loginPage.goto('candidate');
    await loginPage.submit();
    await loginPage.expectFieldValidationError(/bắt buộc|vui lòng nhập/i);
  });

  test('AUTH-02 Negative: Đăng nhập sai mật khẩu hiển thị thông báo lỗi', async ({ page }) => {
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: DEFAULT_CANDIDATE.email,
    });

    await loginPage.goto('candidate');
    await loginPage.login(DEFAULT_CANDIDATE.email!, 'WrongPassword!');

    await loginPage.expectLoginError(/không chính xác|thất bại|lỗi/i);
  });

  test('AUTH-09: Tài khoản bị khóa (is_active: false) bị từ chối đăng nhập', async ({ page, context }) => {
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: 'locked.user@infohr.vn',
      isActive: false,
    });

    await loginPage.goto('candidate');
    await loginPage.login('locked.user@infohr.vn', 'CorrectPassword123!');

    // Hiển thị thông báo tài khoản bị khóa
    await loginPage.expectLoginError(/bị khóa|liên hệ hỗ trợ/i);

    // Không lưu cookie phiên vào trình duyệt
    const cookies = await context.cookies();
    const tokenCookie = cookies.find((c) => c.name === 'access_token');
    expect(tokenCookie).toBeUndefined();
  });

  test('AUTH-07: Đăng xuất an toàn xóa sạch cookies và session', async ({ page, context }) => {
    await injectSession(context, DEFAULT_CANDIDATE);
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: DEFAULT_CANDIDATE.email,
      fullName: DEFAULT_CANDIDATE.fullName,
    });

    // Mở trang tài khoản người dùng
    await page.goto('/account', { waitUntil: 'domcontentloaded' });
    await loginPage.waitForLoadingGone();

    // Tìm nút Đăng xuất trên trang tài khoản hoặc menu
    const logoutBtn = page.getByRole('button', { name: /đăng xuất/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 15_000 });
    await logoutBtn.click();

    // Xác nhận trên modal confirm nếu có
    const confirmModalBtn = page.locator('.MuiDialog-root').getByRole('button', { name: /đăng xuất|đồng ý|xác nhận/i }).first();
    if (await confirmModalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmModalBtn.click();
    }

    // Chờ chuyển hướng về trang đăng nhập hoặc trang chủ
    await page.waitForURL(/\/(login|dang-nhap|$)/, { timeout: 15_000 });

    // Kiểm tra sạch sẽ cookies
    const cookies = await context.cookies();
    const accessToken = cookies.find((c) => c.name === 'access_token');
    const refreshToken = cookies.find((c) => c.name === 'refresh_token');
    expect(accessToken?.value || '').toBe('');
    expect(refreshToken?.value || '').toBe('');
  });
});
