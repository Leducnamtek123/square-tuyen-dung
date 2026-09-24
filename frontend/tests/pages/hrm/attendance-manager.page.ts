import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface AttendanceRequestData {
  employee?: string;
  requestType?: 'LEAVE' | 'REGULARISATION' | 'BUSINESS_TRIP' | 'OVERTIME' | 'LATE_EARLY';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reason: string;
}

/**
 * AttendanceManagerPage - Page Object quản lý Chấm công, Giải trình & Ca làm việc
 * Đường dẫn: /employer/hrm/attendances, /requests, /timesheets, /shifts
 */
export class AttendanceManagerPage extends BasePage {
  readonly pageHeading: Locator;
  readonly createRequestBtn: Locator;
  readonly requestRows: Locator;

  // Create Modal
  readonly createModal: Locator;
  readonly employeeSelect: Locator;
  readonly requestTypeSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly reasonInput: Locator;
  readonly submitRequestBtn: Locator;

  // Reject Dialog
  readonly rejectDialog: Locator;
  readonly rejectReasonInput: Locator;
  readonly confirmRejectBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByText(/quản lý đơn từ chấm công|bảng chấm công|chấm công/i).first();
    this.createRequestBtn = page.getByRole('button', { name: /tạo đơn từ chấm công mới|tạo đơn/i }).first();
    this.requestRows = page.locator('tbody tr');

    // Create Modal
    this.createModal = page.getByRole('dialog').filter({ hasText: /tạo đơn từ chấm công mới/i });
    this.employeeSelect = this.createModal.locator('label:has-text("Nhân viên") + .MuiInputBase-root').or(
      this.createModal.locator('.MuiSelect-select').first()
    );
    this.requestTypeSelect = this.createModal.locator('label:has-text("Loại đơn từ") + .MuiInputBase-root').or(
      this.createModal.locator('.MuiSelect-select').nth(1)
    );
    this.startDateInput = this.createModal.locator('input[type="date"]').first();
    this.endDateInput = this.createModal.locator('input[type="date"]').nth(1);
    this.startTimeInput = this.createModal.locator('input[type="time"]').first();
    this.endTimeInput = this.createModal.locator('input[type="time"]').nth(1);
    this.reasonInput = this.createModal.locator('textarea').first();
    this.submitRequestBtn = this.createModal.getByRole('button', { name: /gửi phê duyệt/i });

    // Reject Dialog
    this.rejectDialog = page.getByRole('dialog').filter({ hasText: /từ chối đơn từ/i });
    this.rejectReasonInput = this.rejectDialog.locator('textarea, input[type="text"]').first();
    this.confirmRejectBtn = this.rejectDialog.getByRole('button', { name: /xác nhận từ chối/i });
  }

  /**
   * Mở trang Quản lý đơn từ chấm công
   */
  async gotoAttendanceRequests() {
    await this.goto('/employer/hrm/attendances/requests');
    await this.waitForLoadingGone();
  }

  /**
   * Mở trang Bảng chấm công chi tiết (Timesheets)
   */
  async gotoTimesheets() {
    await this.goto('/employer/hrm/attendances/timesheets');
    await this.waitForLoadingGone();
  }

  /**
   * Mở trang Danh sách Ca làm việc (Shifts)
   */
  async gotoShifts() {
    await this.goto('/employer/hrm/attendances/shifts');
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal Tạo đơn từ giải trình chấm công
   */
  async openCreateRequestModal() {
    await this.createRequestBtn.click();
    await expect(this.createModal).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Nộp đơn giải trình quên chấm công (Checkin Missing / Regularisation)
   */
  async submitMissingCheckin(date: string, reason: string, employeeName?: string) {
    await this.openCreateRequestModal();

    if (employeeName && (await this.employeeSelect.isVisible())) {
      await this.employeeSelect.click();
      await this.page.getByRole('option', { name: new RegExp(employeeName, 'i') }).first().click();
    }

    if (await this.requestTypeSelect.isVisible()) {
      await this.requestTypeSelect.click();
      await this.page.getByRole('option', { name: /cập nhật công|đề nghị cập nhật công|quên chấm công/i }).first().click();
    }

    if (await this.startDateInput.isVisible()) {
      await this.startDateInput.fill(date);
    }
    if (await this.endDateInput.isVisible()) {
      await this.endDateInput.fill(date);
    }
    if (await this.reasonInput.isVisible()) {
      await this.reasonInput.fill(reason);
    }

    await this.submitRequestBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Quản lý phê duyệt đơn giải trình chấm công
   */
  async approveAttendanceRequest(identifier?: string) {
    const row = identifier
      ? this.requestRows.filter({ hasText: identifier }).first()
      : this.requestRows.first();

    const approveBtn = row
      .locator('button')
      .filter({ hasText: /duyệt & bù công|duyệt cấp 1|duyệt/i })
      .first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });
    await approveBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Từ chối đơn giải trình chấm công kèm lý do
   */
  async rejectAttendanceRequest(identifier: string, reason: string) {
    const row = this.requestRows.filter({ hasText: identifier }).first();
    const rejectBtn = row.locator('button').filter({ hasText: /từ chối/i }).first();
    await expect(rejectBtn).toBeVisible({ timeout: 10_000 });
    await rejectBtn.click();

    await expect(this.rejectDialog).toBeVisible({ timeout: 10_000 });
    await this.rejectReasonInput.fill(reason);
    await this.confirmRejectBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận trạng thái của yêu cầu giải trình
   */
  async expectRequestStatus(identifier: string, statusRegex: string | RegExp) {
    const row = this.requestRows.filter({ hasText: identifier }).first();
    await expect(row.getByText(new RegExp(statusRegex, 'i')).first()).toBeVisible({ timeout: 10_000 });
  }
}
