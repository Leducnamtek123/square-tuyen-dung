import type { Page } from '@playwright/test';
import { setupAuthApiMocks, setupCandidateRegisterApiMocks } from '../helpers/mockApi';
import type { UserRole } from '../helpers/auth';

export interface MockAuthOptions {
  role?: UserRole;
  id?: number;
  email?: string;
  fullName?: string;
  companyId?: number;
  companyName?: string;
  isOnboarded?: boolean;
}

/**
 * Đăng ký các mock endpoints phục vụ luồng Auth (Login, Register, User info, Refresh, Logout)
 */
export async function setupDomainAuthMocks(page: Page, options?: MockAuthOptions) {
  const role: UserRole = options?.role || 'JOB_SEEKER';
  await setupAuthApiMocks(page, {
    role,
    ...options,
  });
  await setupCandidateRegisterApiMocks(page);

  // Mock endpoint quên mật khẩu
  await page.route(/\/api\/v1\/auth\/forgot-password\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.' }),
      });
      return;
    }
    await route.fallback();
  });

  // Mock endpoint đặt lại mật khẩu mới
  await page.route(/\/api\/v1\/auth\/reset-password\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mật khẩu của bạn đã được thay đổi thành công.' }),
      });
      return;
    }
    await route.fallback();
  });
}
