import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * PayrollEnginePage - Page Object cho công cụ tính toán lương Gross-Net và phê duyệt bảng lương
 * Đường dẫn: /employer/hrm/payroll
 */
export class PayrollEnginePage extends BasePage {
  readonly pageHeading: Locator;
  readonly calculateBtn: Locator;
  readonly approveAllBtn: Locator;
  readonly markPaidAllBtn: Locator;
  readonly payrollRows: Locator;

  // Calculate Modal
  readonly calcModal: Locator;
  readonly startCalculateBtn: Locator;

  // Payslip Dialog
  readonly payslipDialog: Locator;
  readonly closePayslipBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByText(/quản lý bảng lương & chi phí doanh nghiệp|bảng lương/i).first();
    this.calculateBtn = page.getByRole('button', { name: /tính bảng lương tháng|tính lương/i }).first();
    this.approveAllBtn = page.getByRole('button', { name: /duyệt toàn bộ|duyệt bảng lương/i }).first();
    this.markPaidAllBtn = page.getByRole('button', { name: /đánh dấu đã chi trả/i }).first();
    this.payrollRows = page.locator('tbody tr');

    // Calc modal
    this.calcModal = page.getByRole('dialog').filter({ hasText: /tính bảng lương tháng/i });
    this.startCalculateBtn = this.calcModal.getByRole('button', { name: /bắt đầu tính/i });

    // Payslip dialog
    this.payslipDialog = page.getByRole('dialog').filter({ hasText: /phiếu lương nhân viên/i });
    this.closePayslipBtn = this.payslipDialog.getByRole('button', { name: /^Đóng$/i }).or(
      this.payslipDialog.locator('button[aria-label="close"], button[aria-label="Close"]')
    );
  }

  /**
   * Điều hướng tới phân hệ Bảng lương
   */
  async gotoPayroll() {
    await this.goto('/employer/hrm/payroll');
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal và thực hiện tính toán tự động bảng lương tháng
   */
  async generatePayroll(month: number = 9, year: number = 2026) {
    await this.calculateBtn.click();
    await expect(this.calcModal).toBeVisible({ timeout: 10_000 });
    await this.startCalculateBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Phê duyệt toàn bộ bảng lương từ trạng thái DRAFT sang APPROVED
   */
  async approvePayroll() {
    await expect(this.approveAllBtn).toBeVisible({ timeout: 10_000 });
    await this.approveAllBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Mở phiếu lương chi tiết của một nhân viên
   */
  async openPayslip(identifier: string) {
    const row = this.payrollRows.filter({ hasText: identifier }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    const viewPayslipBtn = row.locator('button').first();
    await viewPayslipBtn.click();
    await expect(this.payslipDialog).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Đóng phiếu lương
   */
  async closePayslip() {
    if (await this.closePayslipBtn.first().isVisible({ timeout: 2000 })) {
      await this.closePayslipBtn.first().click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Kiểm tra tính toán Gross-to-Net và các tỷ lệ theo luật lao động Việt Nam
   * - BHXH: 8%
   * - BHYT: 1.5%
   * - BHTN: 1%
   * - Thuế TNCN lũy tiến
   * - Chi phí Doanh nghiệp (Người sử dụng lao động): BHXH 17.5% + BHYT 3% + BHTN 1% = 21.5%
   */
  async verifyCalculations(empCode: string) {
    await this.openPayslip(empCode);

    // 1. Kiểm tra khấu trừ bảo hiểm người lao động
    await expect(this.payslipDialog.getByText(/bhxh \(8%\)/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.payslipDialog.getByText(/bhyt \(1\.5%\)/i).first()).toBeVisible();
    await expect(this.payslipDialog.getByText(/bhtn \(1%\)/i).first()).toBeVisible();

    // 2. Kiểm tra thuế TNCN và Lương Net thực lĩnh
    await expect(this.payslipDialog.getByText(/thuế tncn/i).first()).toBeVisible();
    await expect(this.payslipDialog.getByText(/thực lĩnh \(net salary\)/i).first()).toBeVisible();

    // 3. Kiểm tra chi phí doanh nghiệp (Tổng 21.5% gồm BHXH 17.5%, BHYT 3%, BHTN 1%)
    await expect(this.payslipDialog.getByText(/bhxh \(17\.5%\)/i).first()).toBeVisible();
    await expect(this.payslipDialog.getByText(/bhyt \(3%\)/i).first()).toBeVisible();
    await expect(this.payslipDialog.getByText(/bhtn \(1%\)/i).first()).toBeVisible();

    await this.closePayslip();
  }

  /**
   * Xác nhận bảng lương hoặc nhân viên đã có trạng thái Đã duyệt (APPROVED)
   */
  async expectPayrollApproved(empCode?: string) {
    if (empCode) {
      const row = this.payrollRows.filter({ hasText: empCode }).first();
      await expect(row.getByText(/đã duyệt|approved/i).first()).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(this.page.getByText(/đã duyệt|approved/i).first()).toBeVisible({ timeout: 10_000 });
    }
  }
}
