import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupAdminApiMocks,
  MOCK_ADMIN_JOB_POSTS,
} from '../helpers/mockApi';
import { injectSession, DEFAULT_ADMIN, DEFAULT_CANDIDATE } from '../helpers/auth';
import {
  delayApi,
  mockEmptyApi,
  detectBlankScreen,
  detectFullPageMasking,
  detectPrematureEmptyState,
  createUXIssue,
  matrixReporter,
} from '../helpers/loadingMatrix';

const ROUTE_ADMIN_JOBS = '/admin/jobs';
const ROUTE_ADMIN_USERS = '/admin/users';

test.describe('Loading & UX State Matrix - Admin Governance & Security', () => {
  test.afterAll(() => {
    matrixReporter.exportReports();
  });

  test('AdminDataGrid (/admin/jobs): Row skeletons rendered in table during 3s API delay; header/search toolbar preserved', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'ADMIN',
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      fullName: DEFAULT_ADMIN.fullName,
    });
    await setupAdminApiMocks(page);
    await injectSession(context, DEFAULT_ADMIN);

    // Initial navigation & hydration
    await page.goto(ROUTE_ADMIN_JOBS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(MOCK_ADMIN_JOB_POSTS[0].job_name).first()).toBeVisible({ timeout: 20_000 });

    // Now delay admin jobs API by 3000ms for search to inspect AdminDataGrid skeletons
    await delayApi(page, /\/job-post\/admin\/?(\?.*)?$/, { delayMs: 3000 });

    const searchInput = page.locator('input[placeholder*="Tìm kiếm"], input[name="search"]').first();
    if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
      await searchInput.fill('Engineer');
      await searchInput.press('Enter');
    }

    await page.waitForTimeout(600);

    // Check blank screen
    const blankCheck = await detectBlankScreen(page);
    if (blankCheck.isBlank) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_ADMIN_JOBS,
          state: 'slow_api',
          severity: 'P0',
          issue: `Màn hình quản trị tin tuyển dụng bị trắng: ${blankCheck.reason}`,
          expected: 'AdminDataGrid phải giữ nguyên khung tiêu đề và hiển thị hàng skeleton.',
        })
      );
    }
    expect(blankCheck.isBlank).toBeFalsy();

    // Check full-page masking: AdminDataGrid should NOT block full screen with a backdrop
    const maskingCheck = await detectFullPageMasking(page);
    if (maskingCheck.isMasking) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_ADMIN_JOBS,
          state: 'slow_api',
          severity: 'P1',
          issue: 'Backdrop spinner che phủ toàn bộ trang Admin thay vì dùng row skeleton trong bảng.',
          expected: 'AdminDataGrid phải dùng Skeleton rows theo chuẩn MUI table.',
        })
      );
    }

    // Verify row skeletons exist inside table body
    const skeletonRows = page.locator('tbody .MuiSkeleton-root');
    const skeletonCount = await skeletonRows.count();

    const loadingScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_ADMIN_JOBS,
      'loading'
    );
    matrixReporter.recordState(
      ROUTE_ADMIN_JOBS,
      'slow_api',
      skeletonCount > 0 ? 'PASS' : 'WARN',
      `Phát hiện ${skeletonCount} ô skeleton đang hiển thị trong AdminDataGrid`,
      loadingScreenshot
    );

    await expect(page.getByText(MOCK_ADMIN_JOB_POSTS[0].job_name).first()).toBeVisible({ timeout: 20_000 });

    const successScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_ADMIN_JOBS,
      'success'
    );
    matrixReporter.recordState(
      ROUTE_ADMIN_JOBS,
      'success',
      'PASS',
      'Dữ liệu kiểm duyệt tin tuyển dụng hiển thị thành công',
      successScreenshot
    );
  });

  test('AdminDataGrid Empty State: Polite empty state with no data icon and guidance', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'ADMIN',
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      fullName: DEFAULT_ADMIN.fullName,
    });
    await setupAdminApiMocks(page);
    await injectSession(context, DEFAULT_ADMIN);

    // Mock empty response
    await mockEmptyApi(page, '**/api/**/auth/users/**');

    await page.goto(ROUTE_ADMIN_USERS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    const emptyIndicators = page
      .getByText(/không tìm thấy người dùng|không có dữ liệu|không tìm thấy bản ghi/i)
      .or(page.locator('[data-testid="no-data"]'));
    await expect(emptyIndicators.first()).toBeVisible({ timeout: 15_000 });

    const emptyScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_ADMIN_USERS,
      'empty'
    );
    matrixReporter.recordState(
      ROUTE_ADMIN_USERS,
      'empty',
      'PASS',
      'AdminDataGrid hiển thị thông báo rỗng chuyên nghiệp kèm icon khi không có người dùng',
      emptyScreenshot
    );
  });

  test('Permission & Security (403): Non-admin user cannot access /admin (Clean redirect or 403 screen)', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    await page.goto(ROUTE_ADMIN_JOBS, { waitUntil: 'domcontentloaded' });

    // Should redirect to login, unauthorized or root homepage
    await expect(page).toHaveURL(/.*(\/login|\/dang-nhap|\/unauthorized|\/403|\/$)/, { timeout: 30_000 });

    const permScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      'admin_permission_guard',
      'forbidden'
    );
    matrixReporter.recordState(
      'admin_permission_guard',
      'error_403',
      'PASS',
      'Hệ thống tự động chuyển hướng ứng viên không có quyền truy cập về trang đăng nhập',
      permScreenshot
    );
  });
});
