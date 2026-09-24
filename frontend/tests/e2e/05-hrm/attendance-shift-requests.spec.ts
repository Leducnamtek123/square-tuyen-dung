import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainHrmMocks } from '../../mocks/mock-hrm';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { AttendanceManagerPage } from '../../pages/hrm/attendance-manager.page';

test.describe('Phân Hệ HRM - Chấm Công & Giải Trình Ca Làm Việc (Attendance & Shift Requests)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainHrmMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  /**
   * HRM-08: Nộp giải trình quên chấm công và Quản lý phê duyệt bù công
   */
  test('HRM-08: Nộp giải trình quên chấm công (CHECKIN_MISSING) và Quản lý phê duyệt', async ({ page }) => {
    const attendancePage = new AttendanceManagerPage(page);

    // 1. Mở trang Quản lý đơn từ chấm công
    await attendancePage.gotoAttendanceRequests();
    await expect(attendancePage.pageHeading).toBeVisible({ timeout: 20_000 });

    // 2. Nộp giải trình quên chấm công
    await attendancePage.submitMissingCheckin(
      '2026-09-21',
      'Quên chấm công vào ca sáng do lỗi kết nối máy vân tay',
      'Nguyễn Văn A'
    );

    // 3. Quản lý duyệt giải trình và bù công
    await attendancePage.approveAttendanceRequest('Nguyễn Văn A');

    // 4. Kiểm tra trang Bảng chấm công chi tiết (Timesheet)
    await attendancePage.gotoTimesheets();
    await expect(page.getByText(/bảng chấm công chi tiết|bảng công|timesheet/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Nguyễn Văn A').first()).toBeVisible();

    // 5. Kiểm tra trang Danh sách Ca làm việc (Shifts)
    await attendancePage.gotoShifts();
    await expect(page.getByText(/quản lý ca làm việc|ca làm việc/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Ca hành chính').first()).toBeVisible();
  });
});
