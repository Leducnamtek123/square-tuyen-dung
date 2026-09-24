import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks/index';
import { setupDomainAuthMocks } from '../../mocks/mock-auth';
import {
  injectSession,
  DEFAULT_CANDIDATE,
  DEFAULT_EMPLOYER,
} from '../../helpers/auth';

test.describe('Phân hệ 01-Auth: Bảo vệ Route & Phân quyền RBAC (AUTH-03, AUTH-04, AUTH-08)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
  });

  test('AUTH-03: Ứng viên cố tình truy cập /employer/dashboard bị chuyển hướng chặn quyền', async ({
    page,
    context,
  }) => {
    // Inject session vai trò Ứng viên (JOB_SEEKER)
    await injectSession(context, DEFAULT_CANDIDATE);
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: DEFAULT_CANDIDATE.email,
      fullName: DEFAULT_CANDIDATE.fullName,
    });

    // Truy cập trực tiếp vào Cổng Nhà tuyển dụng
    await page.goto('/employer/dashboard', { waitUntil: 'domcontentloaded' });

    // Client gate chặn lại và chuyển hướng về trang chủ '/' hoặc '/forbidden' hoặc '/employer/login'
    await page.waitForURL((url) => {
      const pathname = url.pathname;
      return (
        pathname === '/' ||
        pathname.includes('/forbidden') ||
        pathname.includes('/login') ||
        !pathname.includes('/employer/dashboard')
      );
    }, { timeout: 15_000 });

    expect(page.url()).not.toContain('/employer/dashboard');
  });

  test('AUTH-03: Khách vãng lai chưa đăng nhập truy cập /employer/dashboard bị chuyển hướng sang trang đăng nhập', async ({
    page,
  }) => {
    await page.goto('/employer/dashboard', { waitUntil: 'domcontentloaded' });

    // Middleware hoặc Client Gate bắt buộc chuyển hướng đến login
    await expect(page).toHaveURL(/\/(employer\/login|nha-tuyen-dung\/login|login)/, {
      timeout: 15_000,
    });
  });

  test('AUTH-04: Người dùng không phải Admin (NTD hoặc Ứng viên) truy cập /admin/* bị chặn tuyệt đối', async ({
    page,
    context,
  }) => {
    // Inject session vai trò Nhà tuyển dụng (EMPLOYER)
    await injectSession(context, DEFAULT_EMPLOYER);
    await setupDomainAuthMocks(page, {
      role: 'EMPLOYER',
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
    });

    // Cố truy cập trang Quản trị viên
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    // AdminSectionClient chặn tài khoản non-admin và chuyển hướng ra trang chủ hoặc /forbidden
    await page.waitForURL((url) => {
      const pathname = url.pathname;
      return (
        pathname === '/' ||
        pathname.includes('/forbidden') ||
        pathname.includes('/login') ||
        !pathname.includes('/admin/dashboard')
      );
    }, { timeout: 15_000 });

    expect(page.url()).not.toContain('/admin/dashboard');
  });

  test('AUTH-04: Khách vãng lai truy cập /admin/dashboard bị chuyển hướng tới trang đăng nhập quản trị', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    // Chuyển hướng về trang đăng nhập admin
    await expect(page).toHaveURL(/\/(admin\/login|quan-tri\/login|login)/, {
      timeout: 15_000,
    });
  });

  test('AUTH-08: Tự động silent refresh token khi nhận mã 401 và retry request gốc thành công', async ({
    page,
    context,
  }) => {
    await injectSession(context, DEFAULT_CANDIDATE);
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: DEFAULT_CANDIDATE.email,
    });

    let userInfoAttempts = 0;
    // Intercept endpoint auth/user-info-basic/ để giả lập token hết hạn lần đầu
    await page.route('**/auth/user-info-basic/**', async (route) => {
      userInfoAttempts++;
      if (userInfoAttempts === 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Access token đã hết hạn.' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: DEFAULT_CANDIDATE.id,
          email: DEFAULT_CANDIDATE.email,
          fullName: DEFAULT_CANDIDATE.fullName,
          roleName: 'JOB_SEEKER',
          isOnboarded: true,
        }),
      });
    });

    // Bắt request gọi refresh token tới auth/token/
    const refreshRequestPromise = page.waitForRequest(
      (req) =>
        req.url().includes('/auth/token/') &&
        req.method() === 'POST' &&
        Boolean(req.postData()?.includes('refresh_token'))
    );

    // Mở trang hồ sơ hoặc tài khoản
    await page.goto('/account', { waitUntil: 'domcontentloaded' });

    const refreshRequest = await refreshRequestPromise;
    expect(refreshRequest).toBeDefined();

    // Xác nhận request gốc được retry sau khi refresh thành công
    await expect.poll(() => userInfoAttempts, { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
  });

  test('AUTH-08: Khi cả refresh token cũng hết hạn, hệ thống dọn sạch phiên và kích hoạt đăng xuất', async ({
    page,
    context,
  }) => {
    await injectSession(context, DEFAULT_CANDIDATE);
    await setupDomainAuthMocks(page, {
      role: 'JOB_SEEKER',
      email: DEFAULT_CANDIDATE.email,
    });

    // Giả lập access token hết hạn trả về 401
    await page.route('**/auth/user-info-basic/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Access token đã hết hạn.' }),
      });
    });

    // Giả lập refresh token cũng hết hạn (401)
    await page.route('**/auth/token/**', async (route) => {
      const postData = route.request().postDataJSON() || {};
      if (postData.grant_type === 'refresh_token') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Refresh token hết hạn.' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/account', { waitUntil: 'domcontentloaded' });

    // Kiểm tra cookies bị xóa hoặc chuyển hướng về login
    await expect
      .poll(
        async () => {
          const cookies = await context.cookies();
          const accessToken = cookies.find((c) => c.name === 'access_token');
          return accessToken?.value || '';
        },
        { timeout: 10_000 }
      )
      .toBe('');
  });
});
