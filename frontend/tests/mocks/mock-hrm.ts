import type { Page } from '@playwright/test';
import { setupHrmApiMocks } from '../helpers/mockApi';

/**
 * Đăng ký các mock endpoints phục vụ phân hệ HRM
 */
export async function setupDomainHrmMocks(page: Page) {
  await setupHrmApiMocks(page);

  // Mock duyệt đơn nghỉ phép
  await page.route(/\/api\/v1\/hrm\/leaves\/\d+\/(approve|reject)\/?(\?.*)?$/, async (route) => {
    const isApprove = route.request().url().includes('approve');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        status: isApprove ? 'APPROVED' : 'REJECTED',
        message: isApprove ? 'Đã phê duyệt đơn nghỉ phép.' : 'Đã từ chối đơn nghỉ phép.',
      }),
    });
  });

  // Mock duyệt bảng lương
  await page.route(/\/api\/v1\/hrm\/payroll\/\d+\/approve\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, status: 'APPROVED', message: 'Bảng lương đã được phê duyệt.' }),
    });
  });
}
