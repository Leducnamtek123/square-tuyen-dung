import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface LeaveFormData {
  employee?: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  reason: string;
}

/**
 * LeaveManagerPage - Page Object quản lý Đơn Nghỉ Phép & Quỹ Phép (Leave Management)
 * Đường dẫn: /employer/hrm/leaves
 */
export class LeaveManagerPage extends BasePage {
  readonly pageHeading: Locator;
  readonly requestsTabBtn: Locator;
  readonly balancesTabBtn: Locator;
  readonly createLeaveBtn: Locator;
  readonly pendingMetricCard: Locator;
  readonly approvedMetricCard: Locator;
  readonly rejectedMetricCard: Locator;

  // Create Dialog
  readonly createDialog: Locator;
  readonly employeeSelect: Locator;
  readonly leaveTypeSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly reasonInput: Locator;
  readonly submitLeaveBtn: Locator;

  // Reject Dialog
  readonly rejectDialog: Locator;
  readonly rejectReasonInput: Locator;
  readonly confirmRejectBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByText(/quản lý đơn nghỉ phép|đơn xin nghỉ/i).first();
    this.requestsTabBtn = page.getByRole('button', { name: /đơn nghỉ phép/i }).first();
    this.balancesTabBtn = page.getByRole('button', { name: /quỹ phép/i }).first();
    this.createLeaveBtn = page.getByRole('button', { name: /tạo đơn xin nghỉ|tạo đơn|xin nghỉ/i }).first();

    this.pendingMetricCard = page.locator('div, .MuiCard-root').filter({ hasText: /đơn chờ duyệt/i }).first();
    this.approvedMetricCard = page.locator('div, .MuiCard-root').filter({ hasText: /đã phê duyệt/i }).first();
    this.rejectedMetricCard = page.locator('div, .MuiCard-root').filter({ hasText: /đã từ chối/i }).first();

    // Create dialog
    this.createDialog = page.getByRole('dialog').filter({ hasText: /tạo đơn xin nghỉ/i });
    this.employeeSelect = this.createDialog
      .locator('label:has-text("Nhân viên") + .MuiInputBase-root')
      .or(this.createDialog.getByLabel(/nhân viên/i));
    this.leaveTypeSelect = this.createDialog
      .locator('label:has-text("Loại nghỉ phép") + .MuiInputBase-root')
      .or(this.createDialog.getByLabel(/loại nghỉ phép/i));
    this.startDateInput = this.createDialog.getByLabel(/từ ngày/i);
    this.endDateInput = this.createDialog.getByLabel(/đến ngày/i);
    this.reasonInput = this.createDialog.getByLabel(/lý do nghỉ phép/i);
    this.submitLeaveBtn = this.createDialog.getByRole('button', { name: /gửi đơn nghỉ phép|gửi đơn xin nghỉ|tạo đơn/i });

    // Reject dialog
    this.rejectDialog = page.getByRole('dialog').filter({ hasText: /từ chối đơn nghỉ phép/i });
    this.rejectReasonInput = this.rejectDialog.getByLabel(/lý do từ chối/i);
    this.confirmRejectBtn = this.rejectDialog.getByRole('button', { name: /xác nhận từ chối/i });
  }

  /**
   * Điều hướng tới trang Quản lý Nghỉ phép
   */
  async gotoLeaves() {
    await this.goto('/employer/hrm/leaves');
    await this.waitForLoadingGone();
  }

  /**
   * Chuyển tab giữa Danh sách Đơn và Quỹ Phép
   */
  async switchTab(tab: 'REQUESTS' | 'BALANCES') {
    if (tab === 'REQUESTS') {
      await this.requestsTabBtn.click();
    } else {
      await this.balancesTabBtn.click();
    }
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal Tạo đơn xin nghỉ phép mới
   */
  async openCreateLeaveModal() {
    await this.createLeaveBtn.click();
    await expect(this.createDialog).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Điền form xin nghỉ phép
   */
  async fillLeaveForm(data: LeaveFormData) {
    if (await this.employeeSelect.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.employeeSelect.first().click();
      if (data.employee) {
        await this.page.getByRole('option', { name: new RegExp(data.employee, 'i') }).first().click();
      } else {
        await this.page.getByRole('option').first().click();
      }
    }
    if (data.leaveType && (await this.leaveTypeSelect.first().isVisible({ timeout: 2000 }).catch(() => false))) {
      await this.leaveTypeSelect.first().click();
      await this.page.getByRole('option', { name: new RegExp(data.leaveType, 'i') }).first().click();
    }
    if (data.startDate) {
      await this.startDateInput.fill(data.startDate);
    }
    if (data.endDate) {
      await this.endDateInput.fill(data.endDate);
    }
    if (data.reason) {
      await this.reasonInput.fill(data.reason);
    }
  }

  /**
   * Quy trình nộp đơn xin nghỉ phép
   */
  async createLeaveRequest(data: LeaveFormData) {
    await this.openCreateLeaveModal();
    await this.fillLeaveForm(data);
    await this.submitLeaveBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Phê duyệt đơn xin nghỉ phép của nhân viên
   */
  async approveLeave(identifier?: string) {
    const row = identifier
      ? this.page.locator('tbody tr').filter({ hasText: identifier }).first()
      : this.page.locator('tbody tr').first();
    const approveBtn = row.locator('button').filter({ hasText: /^Duyệt$/i }).first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });
    await approveBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Từ chối đơn xin nghỉ phép kèm theo lý do bắt buộc
   */
  async rejectLeave(identifier: string, reason: string) {
    const row = this.page.locator('tbody tr').filter({ hasText: identifier }).first();
    const rejectBtn = row.locator('button').filter({ hasText: /^Từ chối$/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 10_000 });
    await rejectBtn.click();

    await expect(this.rejectDialog).toBeVisible({ timeout: 10_000 });
    await this.rejectReasonInput.fill(reason);
    await this.confirmRejectBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra trạng thái của đơn sau khi thao tác
   */
  async expectLeaveStatus(identifier: string, statusRegex: string | RegExp) {
    const row = this.page.locator('tbody tr').filter({ hasText: identifier }).first();
    await expect(row.getByText(new RegExp(statusRegex, 'i')).first()).toBeVisible({ timeout: 10_000 });
  }
}
