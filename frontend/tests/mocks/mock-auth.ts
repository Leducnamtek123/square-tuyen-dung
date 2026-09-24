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
  isActive?: boolean;
}

/**
 * Đăng ký các mock endpoints phục vụ luồng Auth (Login, Register, User info, Refresh, Logout, Recovery)
 */
export async function setupDomainAuthMocks(page: Page, options?: MockAuthOptions) {
  const role: UserRole = options?.role || 'JOB_SEEKER';
  await setupAuthApiMocks(page, {
    role,
    ...options,
  });
  await setupCandidateRegisterApiMocks(page);

  // Check creds endpoint for pre-checking credentials
  await page.route('**/auth/check-creds/**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    const postData = route.request().postDataJSON() || {};
    const reqEmail: string = postData.email || options?.email || 'user@infohr.vn';

    if (reqEmail.includes('wrong') || reqEmail.includes('notfound')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          exists: false,
          email: reqEmail,
          email_verified: false,
          emailVerified: false,
          other_role: null,
          otherRole: null,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        exists: true,
        email: reqEmail,
        email_verified: true,
        emailVerified: true,
        other_role: null,
        otherRole: null,
      }),
    });
  });

  // Token endpoint for login & silent token refresh
  await page.route('**/auth/token/**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    const postData = route.request().postDataJSON() || {};

    // 1. Silent token refresh flow (AUTH-08)
    if (postData.grant_type === 'refresh_token') {
      if (postData.refresh_token === 'invalid-refresh-token' || postData.refresh_token?.includes('expired')) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Refresh token đã hết hạn hoặc không hợp lệ.' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'token-refreshed-e2e',
          refresh_token: 'refresh-refreshed-e2e',
          token_type: 'Bearer',
          expires_in: 86400,
        }),
      });
      return;
    }

    // 2. Locked/Disabled user check (AUTH-09)
    const username = postData.username || '';
    if (options?.isActive === false || username.includes('locked') || username.includes('disabled')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: {
            errorMessage: ['Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'],
          },
          non_field_errors: ['Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'],
        }),
      });
      return;
    }

    // 3. Wrong password check (AUTH-02 negative)
    if (postData.password === 'WrongPassword!' || postData.password?.includes('wrong')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: {
            errorMessage: ['Email hoặc mật khẩu không chính xác.'],
          },
          non_field_errors: ['Email hoặc mật khẩu không chính xác.'],
        }),
      });
      return;
    }

    // 4. Successful login
    const targetRole = role.toLowerCase();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: `token-${targetRole}-e2e`,
        refresh_token: `refresh-${targetRole}-e2e`,
        token_type: 'Bearer',
        expires_in: 86400,
      }),
    });
  });

  // Mock endpoint đăng ký ứng viên có kiểm tra trùng lặp (AUTH-01)
  await page.route('**/auth/job-seeker/register/**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    const postData = route.request().postDataJSON() || {};
    if (postData.email?.includes('duplicate') || postData.email?.includes('existing')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: {
            email: ['Email này đã được sử dụng.'],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Đăng ký tài khoản ứng viên thành công!',
      }),
    });
  });

  // Mock endpoint thu hồi token khi đăng xuất (AUTH-07)
  await page.route('**/auth/revoke-token/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Đăng xuất thành công.' }),
    });
  });

  // Mock endpoint quên mật khẩu (AUTH-05)
  await page.route('**/auth/forgot-password/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
        }),
      });
      return;
    }
    await route.fallback();
  });

  // Mock endpoint đặt lại mật khẩu mới (AUTH-06)
  await page.route('**/auth/reset-password/**', async (route) => {
    if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON() || {};
      if (postData.token === 'expired-token' || postData.token?.includes('invalid')) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: {
              errorMessage: ['Liên kết đặt lại mật khẩu đã hết hạn.'],
            },
            message: 'Liên kết đặt lại mật khẩu đã hết hạn.',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Mật khẩu của bạn đã được thay đổi thành công.',
        }),
      });
      return;
    }
    await route.fallback();
  });
}
