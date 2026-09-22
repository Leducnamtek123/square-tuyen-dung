import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupHrmApiMocks,
  MOCK_HRM_EMPLOYEES,
  MOCK_HRM_LEAVE_REQUESTS,
  MOCK_HRM_PAYROLL_RECORDS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';

test.describe('HRM Portal E2E Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupHrmApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  // 1. Dashboard Overview
  test('Employer can view HRM dashboard overview and statistics on /employer/hrm/dashboard', async ({ page }) => {
    await page.goto('/employer/hrm/dashboard');

    // Header title
    await expect(page.getByText('Tổng quan Quản lý Nhân sự (HRM)').first()).toBeVisible({ timeout: 20_000 });

    // KPI cards
    await expect(page.getByText('Nhân sự Chính thức').first()).toBeVisible();
    await expect(page.getByText('Nhân sự Thử việc').first()).toBeVisible();
    await expect(page.getByText('Đơn nghỉ phép chờ duyệt').first()).toBeVisible();
    await expect(page.getByText('Hợp đồng cần tái ký').first()).toBeVisible();

    // Quick action cards
    await expect(page.getByText('Bảng Chấm công Tháng').first()).toBeVisible();
    await expect(page.getByText('Hồ sơ Nhân viên 360°').first()).toBeVisible();
  });

  // 2. Employees Management
  test('Employer can view employee records on /employer/hrm/employees', async ({ page }) => {
    await page.goto('/employer/hrm/employees');

    // Check employee list data rendering
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].full_name).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].employee_code).first()).toBeVisible();
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].department_name).first()).toBeVisible();
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].designation_title).first()).toBeVisible();

    // Check action controls (Add employee button, Search input)
    const addEmployeeBtn = page.locator('button').filter({ hasText: /thêm nhân viên|tạo mới|tạo hồ sơ mới|add employee/i }).first();
    await expect(addEmployeeBtn).toBeVisible();

    const searchInput = page.getByPlaceholder(/tìm theo tên/i);
    await expect(searchInput).toBeVisible();
  });

  test('Employer can filter employees by search query and open Add Employee modal', async ({ page }) => {
    await page.goto('/employer/hrm/employees');

    // Search query filtering
    const searchInput = page.getByPlaceholder(/tìm theo tên/i);
    await searchInput.fill(MOCK_HRM_EMPLOYEES[0].employee_code);
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].full_name).first()).toBeVisible({ timeout: 15_000 });

    // Open Add Employee modal
    const addEmployeeBtn = page.locator('button').filter({ hasText: /thêm nhân viên|tạo mới|tạo hồ sơ mới|add employee/i }).first();
    await addEmployeeBtn.click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/tạo mới nhân sự|thêm nhân viên|hồ sơ nhân sự/i).first()).toBeVisible();
  });

  // 3. Attendances & Timesheet Management
  test('Employer can view attendance management on /employer/hrm/attendances', async ({ page }) => {
    await page.goto('/employer/hrm/attendances');

    // Verify page loads without crashing and renders attendance container
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/chấm công|điểm danh|attendance|bảng công/i).first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('Employer can view work shift configuration on /employer/hrm/attendances/shifts', async ({ page }) => {
    await page.goto('/employer/hrm/attendances/shifts');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/quản lý ca làm việc|danh sách ca làm việc|ca làm việc/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Ca hành chính').first()).toBeVisible();
  });

  test('Employer can view monthly detailed timesheet on /employer/hrm/attendances/timesheets', async ({ page }) => {
    await page.goto('/employer/hrm/attendances/timesheets');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/bảng chấm công chi tiết|bảng công|timesheet/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].full_name).first()).toBeVisible();
  });

  // 4. Leave Requests Management
  test('Employer can view leave requests and status metrics on /employer/hrm/leaves', async ({ page }) => {
    await page.goto('/employer/hrm/leaves');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/quản lý đơn nghỉ phép|đơn nghỉ phép/i).first()).toBeVisible({ timeout: 20_000 });

    // Metric cards
    await expect(page.getByText('Tổng số đơn gửi').first()).toBeVisible();
    await expect(page.getByText('Đơn chờ duyệt').first()).toBeVisible();

    // Table rows
    await expect(page.getByText(MOCK_HRM_LEAVE_REQUESTS[0].employee_name).first()).toBeVisible();
    await expect(page.getByText(MOCK_HRM_LEAVE_REQUESTS[0].reason).first()).toBeVisible();
  });

  test('Employer can open create leave request dialog and approve pending leave on /employer/hrm/leaves', async ({ page }) => {
    await page.goto('/employer/hrm/leaves');

    // Open create leave request dialog
    const createBtn = page.locator('button').filter({ hasText: /tạo đơn xin nghỉ|tạo đơn|xin nghỉ phép/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 20_000 });
    await createBtn.click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/tạo đơn xin nghỉ phép mới|đơn xin nghỉ/i).first()).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');

    // Approve pending leave
    const approveBtn = page.locator('button').filter({ hasText: /^Duyệt$/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
    }
  });

  // 5. Payroll Management
  test('Employer can view payroll list and KPI summaries on /employer/hrm/payroll', async ({ page }) => {
    await page.goto('/employer/hrm/payroll');

    // Verify payroll view rendered
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/quản lý bảng lương & chi phí doanh nghiệp|bảng lương|payroll/i).first()).toBeVisible({ timeout: 20_000 });

    // Summary KPIs
    await expect(page.getByText(/tổng chi phí doanh nghiệp/i).first()).toBeVisible();
    await expect(page.getByText(/tổng thực nhận/i).first()).toBeVisible();

    // Payroll records table
    await expect(page.getByText(MOCK_HRM_PAYROLL_RECORDS[0].employee_name).first()).toBeVisible();
  });

  test('Employer can open calculate payroll modal and view detailed payslip on /employer/hrm/payroll', async ({ page }) => {
    await page.goto('/employer/hrm/payroll');

    // Open Calculate modal
    const calcBtn = page.locator('button').filter({ hasText: /tính bảng lương tháng|tính lương/i }).first();
    await expect(calcBtn).toBeVisible({ timeout: 20_000 });
    await calcBtn.click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/tính bảng lương tháng|tính lương tự động/i).first()).toBeVisible();
    await page.keyboard.press('Escape');

    // Click payslip detail icon in table
    const payslipBtn = page.getByRole('button', { name: /xem phiếu lương chi tiết|xem chi tiết|thao tác/i }).first();
    if (await payslipBtn.isVisible()) {
      await payslipBtn.click();
      await expect(page.getByText(/phiếu lương nhân viên/i).first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
