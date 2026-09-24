import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * JobModerationPage - Page Object cho phân hệ Kiểm duyệt Tin tuyển dụng Admin
 * Đường dẫn: /admin/jobs
 */
export class JobModerationPage extends BasePage {
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly statusFilterSelect: Locator;
  readonly tableRows: Locator;

  // Dialog xác nhận thao tác (AdminConfirmDialog)
  readonly confirmDialog: Locator;
  readonly confirmBtn: Locator;
  readonly cancelBtn: Locator;
  readonly reasonInput: Locator;

  // Thao tác hàng loạt (Bulk actions)
  readonly bulkApproveBtn: Locator;
  readonly bulkRejectBtn: Locator;

  // Drawer xem chi tiết tin tuyển dụng
  readonly detailDrawer: Locator;
  readonly drawerApproveBtn: Locator;
  readonly drawerRejectBtn: Locator;
  readonly closeDrawerBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByText(/kiểm duyệt|tin tuyển dụng/i).first();
    this.searchInput = page.getByPlaceholder(/tìm kiếm tin tuyển dụng/i).first();
    this.statusFilterSelect = page.locator('label:has-text("Trạng thái") + .MuiInputBase-root').or(
      page.getByRole('combobox', { name: /trạng thái/i })
    ).first();
    this.tableRows = page.locator('tbody tr');

    // Dialog elements
    this.confirmDialog = page.getByRole('dialog').filter({ hasText: /phê duyệt|từ chối|xác nhận/i });
    this.confirmBtn = page.getByTestId('admin-confirm-btn');
    this.cancelBtn = page.getByTestId('admin-cancel-btn');
    this.reasonInput = page.getByTestId('admin-reason-input').locator('textarea, input').first();

    // Bulk buttons
    this.bulkApproveBtn = page.getByRole('button', { name: /duyệt hàng loạt/i }).first();
    this.bulkRejectBtn = page.getByRole('button', { name: /từ chối hàng loạt/i }).first();

    // Drawer elements
    this.detailDrawer = page.locator('.MuiDrawer-paper');
    this.drawerApproveBtn = this.detailDrawer.getByRole('button', { name: /phê duyệt ngay/i }).first();
    this.drawerRejectBtn = this.detailDrawer.getByRole('button', { name: /từ chối tin/i }).first();
    this.closeDrawerBtn = this.detailDrawer.getByRole('button', { name: /đóng/i }).or(this.detailDrawer.locator('button[aria-label="close"]')).first();
  }

  /**
   * Điều hướng tới trang Quản lý tin tuyển dụng
   */
  async gotoJobs() {
    await this.goto('/admin/jobs');
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận danh sách tin tuyển dụng đã nạp thành công
   */
  async expectJobsLoaded() {
    await expect(this.tableRows.first()).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Tìm kiếm tin tuyển dụng theo từ khóa
   */
  async searchJob(keyword: string) {
    if (await this.searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.searchInput.fill(keyword);
      await this.page.waitForTimeout(600);
      await this.waitForLoadingGone();
    }
  }

  /**
   * Lọc theo trạng thái tin
   */
  async filterByStatus(statusLabel: string) {
    if (await this.statusFilterSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.statusFilterSelect.click();
      const option = this.page.getByRole('option', { name: new RegExp(statusLabel, 'i') }).first();
      await option.click();
      await this.waitForLoadingGone();
    }
  }

  /**
   * Tìm hàng (row) chứa tên tin tuyển dụng
   */
  getJobRow(jobName: string): Locator {
    return this.tableRows.filter({ hasText: jobName }).first();
  }

  /**
   * Phê duyệt một tin tuyển dụng (Single Approve)
   */
  async approveJob(jobName?: string) {
    const targetRow = jobName ? this.getJobRow(jobName) : this.tableRows.first();
    await expect(targetRow).toBeVisible({ timeout: 15_000 });

    const approveBtn = targetRow.getByTestId('approve-job-btn').first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });
    await approveBtn.click();

    // Xác nhận trên dialog
    await expect(this.confirmBtn).toBeVisible({ timeout: 10_000 });
    await this.confirmBtn.click();
    await expect(this.confirmBtn).toBeHidden({ timeout: 10_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Từ chối một tin tuyển dụng kèm lý do (Single Reject)
   */
  async rejectJob(jobName: string | undefined, reason: string) {
    const targetRow = jobName ? this.getJobRow(jobName) : this.tableRows.first();
    await expect(targetRow).toBeVisible({ timeout: 15_000 });

    const rejectBtn = targetRow.getByTestId('reject-job-btn').first();
    await expect(rejectBtn).toBeVisible({ timeout: 10_000 });
    await rejectBtn.click();

    // Điền lý do từ chối trên dialog
    await expect(this.reasonInput).toBeVisible({ timeout: 10_000 });
    await this.reasonInput.fill(reason);

    // Bấm xác nhận từ chối
    await expect(this.confirmBtn).toBeVisible({ timeout: 10_000 });
    await this.confirmBtn.click();
    await expect(this.confirmBtn).toBeHidden({ timeout: 10_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Chọn nhiều tin qua checkbox hàng để thực hiện kiểm duyệt hàng loạt
   */
  async selectMultipleJobs(count: number = 2) {
    const checkboxes = this.page.locator('tbody tr input[type="checkbox"]');
    const availableCount = await checkboxes.count();
    const selectCount = Math.min(count, availableCount);

    for (let i = 0; i < selectCount; i++) {
      const cb = checkboxes.nth(i);
      if (!(await cb.isChecked())) {
        await cb.check({ force: true });
      }
    }
  }

  /**
   * Phê duyệt hàng loạt (Batch Approve)
   */
  async batchApprove() {
    await expect(this.bulkApproveBtn).toBeVisible({ timeout: 10_000 });
    await this.bulkApproveBtn.click();

    await expect(this.confirmBtn).toBeVisible({ timeout: 10_000 });
    await this.confirmBtn.click();
    await expect(this.confirmBtn).toBeHidden({ timeout: 10_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Từ chối hàng loạt kèm lý do (Batch Reject)
   */
  async bulkReject(reason: string) {
    await expect(this.bulkRejectBtn).toBeVisible({ timeout: 10_000 });
    await this.bulkRejectBtn.click();

    await expect(this.reasonInput).toBeVisible({ timeout: 10_000 });
    await this.reasonInput.fill(reason);

    await expect(this.confirmBtn).toBeVisible({ timeout: 10_000 });
    await this.confirmBtn.click();
    await expect(this.confirmBtn).toBeHidden({ timeout: 10_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Mở Drawer xem chi tiết tin tuyển dụng
   */
  async openJobDetail(jobName: string) {
    const jobTitleLink = this.page.getByText(jobName).first();
    await expect(jobTitleLink).toBeVisible({ timeout: 15_000 });
    await jobTitleLink.click();
    await expect(this.detailDrawer).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Đóng Drawer chi tiết
   */
  async closeDetailDrawer() {
    if (await this.detailDrawer.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.closeDrawerBtn.click();
      await expect(this.detailDrawer).toBeHidden({ timeout: 10_000 });
    }
  }

  /**
   * Kiểm tra nhãn trạng thái của tin tuyển dụng trong bảng
   */
  async expectJobStatus(jobName: string, statusPattern: RegExp | string) {
    const targetRow = this.getJobRow(jobName);
    await expect(targetRow).toBeVisible({ timeout: 15_000 });
    const badge = targetRow.locator('.MuiChip-root, span').filter({ hasText: statusPattern }).first();
    await expect(badge).toBeVisible({ timeout: 10_000 });
  }
}
