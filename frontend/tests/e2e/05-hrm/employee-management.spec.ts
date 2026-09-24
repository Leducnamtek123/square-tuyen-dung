import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainHrmMocks } from '../../mocks/mock-hrm';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { EmployeeDirectoryPage } from '../../pages/hrm/employee-directory.page';
import { HrmDashboardPage } from '../../pages/hrm/hrm-dashboard.page';

test.describe('Phân Hệ HRM - Quản Lý Nhân Sự (Employee Management)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainHrmMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  /**
   * HRM-01: Thêm mới nhân sự (EMP-xxx), tìm kiếm và lọc theo phòng ban
   */
  test('HRM-01: Tạo nhân viên mới (EMP-xxx), tìm kiếm và lọc theo phòng ban', async ({ page }) => {
    const employeePage = new EmployeeDirectoryPage(page);

    // 1. Mở trang Quản lý hồ sơ nhân viên
    await employeePage.gotoEmployees();
    await expect(employeePage.pageHeading).toBeVisible({ timeout: 20_000 });

    // 2. Mở modal tạo mới nhân sự và điền thông tin
    await employeePage.openCreateEmployeeModal();
    await employeePage.fillEmployeeForm({
      firstName: 'Văn Bình',
      lastName: 'Trần',
      email: 'tranvanbinh@infohr.vn',
      phone: '0912345678',
      department: 'Công nghệ thông tin',
      designation: 'Kỹ sư phần mềm',
      status: 'Chính thức (Active)',
    });
    await employeePage.submitEmployeeForm();
    await employeePage.waitForLoadingGone();

    // 3. Tìm kiếm nhân sự theo từ khóa
    await employeePage.searchEmployee('EMP-001');
    await employeePage.expectEmployeeInTable('Nguyễn Văn A');

    // 4. Lọc nhân sự theo phòng ban
    await employeePage.filterByDepartment('Công nghệ thông tin');
    await employeePage.expectEmployeeInTable('Nguyễn Văn A');
  });

  /**
   * HRM-01 Negative: Báo lỗi khi tạo nhân viên trùng mã trong hệ thống
   */
  test('HRM-01 Negative: Báo lỗi validation khi nhập trùng mã nhân viên đã tồn tại', async ({ page }) => {
    // Thiết lập mock báo lỗi trùng mã
    await setupDomainHrmMocks(page, { duplicateEmployeeCode: true });

    const employeePage = new EmployeeDirectoryPage(page);
    await employeePage.gotoEmployees();

    await employeePage.openCreateEmployeeModal();
    await employeePage.fillEmployeeForm({
      firstName: 'Văn A',
      lastName: 'Nguyễn',
      email: 'nguyenvana@infohr.vn',
    });
    await employeePage.submitEmployeeForm();

    // Xác nhận hiển thị thông báo lỗi trùng mã hoặc cảnh báo alert
    const errorAlert = page.locator('.MuiAlert-root, [role="alert"], p, div').filter({
      hasText: /mã nhân viên đã tồn tại|duplicate_code/i,
    });
    await expect(errorAlert.first()).toBeVisible({ timeout: 10_000 });
  });

  /**
   * HRM-02: Xem chi tiết hồ sơ nhân sự 360 độ và cập nhật trạng thái thôi việc (TERMINATED)
   */
  test('HRM-02: Xem hồ sơ chi tiết 360° và cập nhật trạng thái thôi việc (TERMINATED)', async ({ page }) => {
    const employeePage = new EmployeeDirectoryPage(page);
    await employeePage.gotoEmployees();

    // 1. Mở xem chi tiết hồ sơ 360 độ trong Drawer
    await employeePage.openEmployeeDrawer('EMP-001');
    await expect(page.getByText('Hồ sơ Nhân viên').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nguyễn Văn A').first()).toBeVisible();

    // Kiểm tra các tab thông tin
    await expect(page.getByText(/lịch sử công tác/i).first()).toBeVisible();
    await expect(page.getByText(/tài liệu số/i).first()).toBeVisible();

    // 2. Đóng Drawer
    await employeePage.closeEmployeeDrawer();

    // 3. Cập nhật trạng thái thôi việc (TERMINATED)
    await employeePage.terminateEmployee('EMP-001');
  });
});
