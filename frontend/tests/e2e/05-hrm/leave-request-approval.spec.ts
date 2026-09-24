import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainHrmMocks } from '../../mocks/mock-hrm';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { LeaveManagerPage } from '../../pages/hrm/leave-manager.page';

test.describe('Phân Hệ HRM - Quy Trình Phê Duyệt Đơn Nghỉ Phép (Leave Request & Approval)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainHrmMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  /**
   * HRM-03: Nộp đơn xin nghỉ phép 2 ngày và Quản lý phê duyệt (Approve)
   */
  test('HRM-03: Nộp đơn xin nghỉ phép 2 ngày và Quản lý phê duyệt cấn trừ quỹ phép', async ({ page }) => {
    const leavePage = new LeaveManagerPage(page);

    // 1. Mở trang Quản lý đơn nghỉ phép
    await leavePage.gotoLeaves();
    await expect(leavePage.pageHeading).toBeVisible({ timeout: 20_000 });

    // 2. Mở modal và tạo đơn xin nghỉ phép 2 ngày
    await leavePage.createLeaveRequest({
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      reason: 'Nghỉ phép năm giải quyết việc gia đình',
    });

    // 3. Quản lý phê duyệt đơn nghỉ phép
    await leavePage.approveLeave('Nguyễn Văn A');

    // 4. Kiểm tra tab Quỹ Phép & Hạn mức
    await leavePage.switchTab('BALANCES');
    await expect(page.getByText(/hạn mức phép|phép năm|quỹ phép/i).first()).toBeVisible({ timeout: 15_000 });
  });

  /**
   * HRM-04: Từ chối đơn xin nghỉ phép kèm theo lý do bắt buộc
   */
  test('HRM-04: Quản lý từ chối đơn xin nghỉ phép kèm theo lý do bắt buộc', async ({ page }) => {
    const leavePage = new LeaveManagerPage(page);
    await leavePage.gotoLeaves();

    // 1. Quản lý thực hiện từ chối đơn của nhân viên kèm lý do
    const rejectionReason = 'Dự án đang trong giai đoạn phát hành khẩn cấp';
    await leavePage.rejectLeave('Nguyễn Văn A', rejectionReason);

    // 2. Xác nhận trạng thái đơn chuyển sang Đã từ chối hoặc REJECTED
    await leavePage.expectLeaveStatus('Nguyễn Văn A', /đã từ chối|từ chối|rejected/i);
  });
});
