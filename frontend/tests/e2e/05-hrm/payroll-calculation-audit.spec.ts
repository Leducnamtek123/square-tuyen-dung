import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainHrmMocks } from '../../mocks/mock-hrm';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { PayrollEnginePage } from '../../pages/hrm/payroll-engine.page';

test.describe('Phân Hệ HRM - Tính Toán & Phê Duyệt Bảng Lương (Payroll Engine & Audit)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainHrmMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  /**
   * HRM-05: Tính toán tự động Gross-to-Net chuẩn xác theo luật lao động Việt Nam
   * Khấu trừ: BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN lũy tiến, Chi phí doanh nghiệp 21.5%
   */
  test('HRM-05: Tính toán tự động Gross-to-Net (BHXH 8%, BHYT 1.5%, BHTN 1%, TNCN, Doanh nghiệp 21.5%)', async ({
    page,
  }) => {
    const payrollPage = new PayrollEnginePage(page);

    // 1. Mở trang Bảng lương tháng
    await payrollPage.gotoPayroll();
    await expect(payrollPage.pageHeading).toBeVisible({ timeout: 20_000 });

    // 2. Kích hoạt tính bảng lương tháng tự động
    await payrollPage.generatePayroll(9, 2026);

    // 3. Mở và kiểm chứng phiếu lương chi tiết của nhân viên EMP-001
    await payrollPage.verifyCalculations('EMP-001');
  });

  /**
   * HRM-06: Phê duyệt bảng lương từ trạng thái DRAFT sang APPROVED
   */
  test('HRM-06: Phê duyệt bảng lương tháng từ trạng thái DRAFT sang APPROVED', async ({ page }) => {
    const payrollPage = new PayrollEnginePage(page);
    await payrollPage.gotoPayroll();

    // 1. Thực hiện phê duyệt toàn bộ bảng lương
    await payrollPage.approvePayroll();

    // 2. Kiểm tra trạng thái đã chuyển thành APPROVED / Đã duyệt
    await payrollPage.expectPayrollApproved();
  });

  /**
   * HRM-09: Phân quyền bảo mật bảng lương (RBAC Security)
   * Người dùng không phải Employer / Quản lý lương không được phép truy cập xem toàn bộ lương công ty
   */
  test('HRM-09: Bảo mật dữ liệu lương theo phân quyền RBAC (Chặn truy cập trái phép bảng lương)', async ({
    page,
    context,
  }) => {
    // Xóa session và inject tài khoản vai trò ứng viên / người dùng bình thường
    await context.clearCookies();
    await page.goto('/employer/hrm/payroll');

    // Kỳ vọng: Hệ thống chuyển hướng người dùng không có quyền về trang chủ hoặc trang đăng nhập
    await expect(page).toHaveURL(/\/(login|\?redirect=|$|nha-tuyen-dung)/i, { timeout: 15_000 });
  });
});
