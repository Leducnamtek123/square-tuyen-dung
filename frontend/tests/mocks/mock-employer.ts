import type { Page } from '@playwright/test';
import { setupEmployerApiMocks } from '../helpers/mockApi';

/**
 * Đăng ký các mock endpoints phục vụ luồng Employer & ATS
 */
export async function setupDomainEmployerMocks(page: Page) {
  await setupEmployerApiMocks(page);

  // Mock đóng / mở lại tin tuyển dụng
  await page.route(/\/api\/v1\/employer\/job-posts\/\d+\/(close|reopen)\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Cập nhật trạng thái tin tuyển dụng thành công.' }),
    });
  });

  // Mock gửi yêu cầu xác thực doanh nghiệp
  await page.route(/\/api\/v1\/employer\/company\/verification\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: 'PENDING', message: 'Hồ sơ xác thực đã được gửi.' }),
      });
      return;
    }
    await route.fallback();
  });
}
