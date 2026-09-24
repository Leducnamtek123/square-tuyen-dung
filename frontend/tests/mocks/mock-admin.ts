import type { Page } from '@playwright/test';
import {
  setupAdminApiMocks,
  MOCK_CAREERS,
  MOCK_AUDIT_LOGS,
  MOCK_ADMIN_JOB_POSTS,
  MOCK_COMPANY_VERIFICATIONS,
  MOCK_ADMIN_USERS,
} from '../helpers/mockApi';

export interface SetupAdminOptions {
  revokedUserId?: number;
  initialCareers?: typeof MOCK_CAREERS;
}

/**
 * Đăng ký các mock endpoints phục vụ cổng Quản trị viên Admin
 */
export async function setupDomainAdminMocks(page: Page, options?: SetupAdminOptions) {
  await setupAdminApiMocks(page);

  const dynamicCareers = [...(options?.initialCareers || MOCK_CAREERS)];

  // Mock phê duyệt / từ chối tin tuyển dụng
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

  // Mock Quản lý danh mục ngành nghề (Taxonomies: Careers)
  await page.route(/(common\/admin\/careers|api\/.*\/common\/admin\/careers)(\/|\?|$)/, async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      let payload: Record<string, any> = {};
      try {
        const postData = route.request().postData();
        if (postData && postData.startsWith('{')) {
          payload = JSON.parse(postData);
        } else {
          // Form data or multipart
          payload = { name: 'Công nghệ Bán dẫn / Vi mạch' };
        }
      } catch {
        payload = { name: 'Công nghệ Bán dẫn / Vi mạch' };
      }

      const newCareer = {
        id: 999,
        name: payload.name || 'Công nghệ Bán dẫn / Vi mạch',
        slug: 'cong-nghe-ban-dan-vi-mach',
        jobPostTotal: 0,
        isHot: false,
        iconUrl: null,
      };

      dynamicCareers.push(newCareer as any);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newCareer),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: dynamicCareers.length, results: dynamicCareers }),
    });
  });

  // Mock danh mục ngành nghề cho cổng tìm việc ứng viên (phản ánh ngành nghề mới tạo)
  await page.route(/\/common\/(all-careers|careers|top-careers)\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: dynamicCareers.length, results: dynamicCareers }),
    });
  });

  // Mock nhật ký kiểm toán (Audit Logs) nâng cao với diff, IP, actor, action, timestamp
  await page.route('**/api/**/common/admin/audit-logs/**', async (route) => {
    const url = route.request().url();
    let filteredLogs = [...MOCK_AUDIT_LOGS];

    // Filter by action
    const actionMatch = url.match(/[?&]action=([^&]+)/);
    if (actionMatch && actionMatch[1]) {
      const act = decodeURIComponent(actionMatch[1]).toLowerCase();
      filteredLogs = filteredLogs.filter((l) => l.action.toLowerCase().includes(act));
    }

    // Filter by actor email
    const actorMatch = url.match(/[?&]actorEmail=([^&]+)/);
    if (actorMatch && actorMatch[1]) {
      const actor = decodeURIComponent(actorMatch[1]).toLowerCase();
      filteredLogs = filteredLogs.filter((l) => (l.actorEmail || l.actor_email).toLowerCase().includes(actor));
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: filteredLogs.length, results: filteredLogs }),
    });
  });

  // Mock kiểm tra thu hồi phiên (session revocation check)
  if (options?.revokedUserId) {
    await page.route('**/api/**/auth/me/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Tài khoản đã bị khóa hoặc phiên đăng nhập đã bị thu hồi.',
          code: 'USER_DEACTIVATED',
        }),
      });
    });
  }
}
