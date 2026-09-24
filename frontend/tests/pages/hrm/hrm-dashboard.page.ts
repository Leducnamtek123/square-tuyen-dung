import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * HrmDashboardPage - Page Object cho trang Tổng quan Quản lý Nhân sự (HRM Dashboard)
 * Đường dẫn: /employer/hrm/dashboard
 */
export class HrmDashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly activeEmployeesCard: Locator;
  readonly probationEmployeesCard: Locator;
  readonly pendingLeavesCard: Locator;
  readonly expiringContractsCard: Locator;
  readonly timesheetActionBtn: Locator;
  readonly employee360ActionBtn: Locator;
  readonly addEmployeeBtn: Locator;
  readonly orgChartLink: Locator;
  readonly payrollLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByText(/tổng quan quản lý nhân sự \(hrm\)/i).first();
    this.activeEmployeesCard = page.locator('div, .MuiCard-root').filter({ hasText: /nhân sự chính thức/i }).first();
    this.probationEmployeesCard = page.locator('div, .MuiCard-root').filter({ hasText: /nhân sự thử việc/i }).first();
    this.pendingLeavesCard = page.locator('div, .MuiCard-root').filter({ hasText: /đơn nghỉ phép chờ duyệt/i }).first();
    this.expiringContractsCard = page.locator('div, .MuiCard-root').filter({ hasText: /hợp đồng cần tái ký/i }).first();
    this.timesheetActionBtn = page.getByText(/bảng chấm công tháng/i).first();
    this.employee360ActionBtn = page.getByText(/hồ sơ nhân viên 360°/i).first();
    this.addEmployeeBtn = page.getByRole('button', { name: /thêm nhân sự mới|tạo mới nhân sự|tạo hồ sơ/i }).first();
    this.orgChartLink = page.getByText(/sơ đồ tổ chức/i).first();
    this.payrollLink = page.getByText(/bảng lương & chi phí/i).first();
  }

  /**
   * Điều hướng tới HRM Dashboard
   */
  async gotoDashboard() {
    await this.goto('/employer/hrm/dashboard');
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận trang Tổng quan HRM tải thành công với đầy đủ các thẻ chỉ số
   */
  async expectOverviewLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 20_000 });
    await expect(this.activeEmployeesCard).toBeVisible({ timeout: 15_000 });
    await expect(this.probationEmployeesCard).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Kiểm tra tất cả 4 thẻ KPI nhân sự chính
   */
  async expectKpiCardsVisible() {
    await expect(this.activeEmployeesCard).toBeVisible();
    await expect(this.probationEmployeesCard).toBeVisible();
    await expect(this.pendingLeavesCard).toBeVisible();
    await expect(this.expiringContractsCard).toBeVisible();
  }
}
