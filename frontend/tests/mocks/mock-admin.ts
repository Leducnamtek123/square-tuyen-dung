import type { Page } from '@playwright/test';
import { setupAdminApiMocks } from '../helpers/mockApi';

/**
 * Đăng ký các mock endpoints phục vụ cổng Quản trị viên Admin
 */
export async function setupDomainAdminMocks(page: Page) {
  await setupAdminApiMocks(page);

  // Mock phê duyệt tin tuyển dụng
  await page.route(/\/api\/v1\/admin\/jobs\/\d+\/(approve|reject)\/?(\?.*)?$/, async (route) => {
    const isApprove = route.request().url().includes('approve');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        status: isApprove ? 'APPROVED' : 'REJECTED',
        message: isApprove ? 'Tin tuyển dụng đã được phê duyệt.' : 'Tin tuyển dụng đã bị từ chối.',
      }),
    });
  });

  // Mock xác minh doanh nghiệp
  await page.route(/\/api\/v1\/admin\/companies\/\d+\/verify\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, is_verified: true, message: 'Doanh nghiệp đã được xác thực thành công.' }),
    });
  });

  // Mock khóa / mở khóa người dùng
  await page.route(/\/api\/v1\/admin\/users\/\d+\/toggle-status\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Trạng thái người dùng đã được cập nhật.' }),
    });
  });
}
