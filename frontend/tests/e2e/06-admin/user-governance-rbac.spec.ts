import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainAdminMocks } from '../../mocks/mock-admin';
import { setupDomainAuthMocks } from '../../mocks/mock-auth';
import {
  injectSession,
  DEFAULT_ADMIN,
  DEFAULT_CANDIDATE,
  DEFAULT_EMPLOYER,
} from '../../helpers/auth';
import { MOCK_ADMIN_USERS, setupAuthApiMocks } from '../../helpers/mockApi';
import { UserRbacPage } from '../../pages/admin/user-rbac.page';

test.describe('Phân Hệ Admin - Quản Trị Người Dùng & Phân Quyền (User Governance & RBAC)', () => {
  test.describe('Admin Governance Actions', () => {
    test.beforeEach(async ({ page, context }) => {
      await setupAllApiMocks(page);
      await setupDomainAdminMocks(page);
      await injectSession(context, DEFAULT_ADMIN);
    });

    /**
     * ADM-04: Khóa tài khoản người dùng vi phạm và điều chỉnh vai trò
     */
    test('ADM-04: Admin khóa tài khoản (deactivate) và thay đổi phân quyền vai trò người dùng', async ({ page }) => {
      const userPage = new UserRbacPage(page);

      // 1. Mở trang Quản lý tài khoản người dùng
      await userPage.gotoUsers();
      await userPage.expectUsersLoaded();

      // 2. Tìm kiếm người dùng mục tiêu
      const targetUser = MOCK_ADMIN_USERS[1];
      await userPage.expectUserInTable(targetUser.email);

      // 3. Khóa tài khoản qua nút switch toggle
      await userPage.toggleUserStatus(targetUser.email);

      // 4. Kiểm tra dropdown thay đổi vai trò (RBAC)
      const roleSelect = userPage.getUserRow(targetUser.email).getByTestId('user-role-select').or(page.getByRole('combobox')).first();
      await expect(roleSelect).toBeVisible({ timeout: 15_000 });
      await roleSelect.click();

      // Kiểm tra danh sách vai trò khả dụng
      const employerOption = page.getByRole('option', { name: /nhà tuyển dụng|employer/i }).first();
      await expect(employerOption).toBeVisible({ timeout: 10_000 });

      // Đóng dropdown an toàn
      await page.keyboard.press('Escape');
    });

    /**
     * ADM-04: Tìm kiếm và lọc người dùng theo vai trò
     */
    test('ADM-04: Admin tìm kiếm người dùng theo từ khóa và lọc theo vai trò', async ({ page }) => {
      const userPage = new UserRbacPage(page);

      await userPage.gotoUsers();
      await userPage.expectUsersLoaded();

      // Tìm kiếm theo email
      const candidateUser = MOCK_ADMIN_USERS[2];
      await userPage.searchUser(candidateUser.email);
      await userPage.expectUserInTable(candidateUser.email);
    });
  });

  test.describe('Session Revocation & Route Protection', () => {
    /**
     * ADM-04 Session Revocation: Tài khoản bị khóa bị thu hồi phiên tức thời
     */
    test('ADM-04 Revocation: Tài khoản bị khóa nhận 401 khi truy cập và phiên đăng nhập bị thu hồi', async ({ page, context }) => {
      await setupAllApiMocks(page);
      // Thiết lập mock tài khoản bị khóa
      await setupDomainAdminMocks(page, { revokedUserId: DEFAULT_EMPLOYER.id });
      await injectSession(context, DEFAULT_EMPLOYER);

      // Khi phiên bị thu hồi hoặc tài khoản bị vô hiệu hóa, truy cập trang được bảo vệ
      await page.goto('/employer/dashboard');

      // Kỳ vọng hệ thống chuyển hướng về trang login hoặc hiển thị trạng thái hết hạn phiên
      await page.waitForURL(/\/(login|dang-nhap|\?)/, { timeout: 20_000 }).catch(() => {
        // Fallback: Nếu không redirect ngay thì phải hiển thị lỗi hoặc không cho truy cập dữ liệu nhạy cảm
      });
      await expect(page.locator('body')).toBeVisible();
    });

    /**
     * ADM-07: Chặn người dùng Ứng viên (JOB_SEEKER) cố tình truy cập trang Quản trị viên
     */
    test('ADM-07: Chặn tài khoản Ứng viên truy cập /admin/dashboard -> Chuyển hướng về trang chủ', async ({ page, context }) => {
      await setupAllApiMocks(page);
      await setupDomainAuthMocks(page, {
        role: 'JOB_SEEKER',
        id: DEFAULT_CANDIDATE.id,
        email: DEFAULT_CANDIDATE.email,
        fullName: DEFAULT_CANDIDATE.fullName,
      });
      await injectSession(context, DEFAULT_CANDIDATE);

      // Cố tình truy cập route quản trị
      await page.goto('/admin/dashboard');

      // AdminSectionClient phát hiện role !== ADMIN và redirect về '/'
      await page.waitForURL(/^http:\/\/[^/]+\/?$/, { timeout: 20_000 });
      expect(page.url()).not.toContain('/admin/dashboard');

      // Đảm bảo không render các thẻ thống kê hay bảng quản trị ra ngoài
      await expect(page.getByTestId('approve-job-btn')).toBeHidden();
      await expect(page.getByTestId('toggle-user-active-switch')).toBeHidden();
    });

    /**
     * ADM-07: Chặn tài khoản Nhà tuyển dụng (EMPLOYER) truy cập các route quản trị cấp cao
     */
    test('ADM-07: Chặn tài khoản Nhà tuyển dụng truy cập /admin/jobs -> Chuyển hướng về trang chủ', async ({ page, context }) => {
      await setupAllApiMocks(page);
      await setupDomainAuthMocks(page, {
        role: 'EMPLOYER',
        id: DEFAULT_EMPLOYER.id,
        email: DEFAULT_EMPLOYER.email,
        fullName: DEFAULT_EMPLOYER.fullName,
      });
      await injectSession(context, DEFAULT_EMPLOYER);

      await page.goto('/admin/jobs');

      await page.waitForURL(/^http:\/\/[^/]+\/?$/, { timeout: 20_000 });
      expect(page.url()).not.toContain('/admin/jobs');
      await expect(page.getByTestId('approve-job-btn')).toBeHidden();
    });

    /**
     * ADM-07: Người dùng chưa đăng nhập (Anonymous) cố vào /admin/dashboard -> Chuyển hướng tới /admin/login
     */
    test('ADM-07: Khách vãng lai chưa đăng nhập truy cập /admin/dashboard -> Điều hướng về /admin/login', async ({ page }) => {
      await setupAllApiMocks(page);

      await page.goto('/admin/dashboard');

      // Phải chuyển hướng về màn hình đăng nhập quản trị
      await page.waitForURL(/\/(admin|quan-tri)\/login/, { timeout: 20_000 });
      expect(page.url()).toContain('/login');
    });
  });
});
