import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CompanyVerifyPage - Page Object cho phân hệ Xác thực Doanh nghiệp (KYC)
 * Đường dẫn: /admin/company-verifications
 */
export class CompanyVerifyPage extends BasePage {
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly statusFilterSelect: Locator;
  readonly tableRows: Locator;

  // Dialog xác nhận (AdminConfirmDialog)
  readonly confirmDialog: Locator;
  readonly confirmBtn: Locator;
  readonly cancelBtn: Locator;
  readonly reasonInput: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByText(/xác thực doanh nghiệp|kyc/i).first();
    this.searchInput = page.getByPlaceholder(/tìm kiếm doanh nghiệp|tìm kiếm/i).first();
    this.statusFilterSelect = page.locator('label:has-text("Trạng thái") + .MuiInputBase-root').or(
      page.getByRole('combobox', { name: /trạng thái/i })
    ).first();
    this.tableRows = page.locator('tbody tr');

    // Dialog elements
    this.confirmDialog = page.getByRole('dialog').filter({ hasText: /xác thực|từ chối|phê duyệt/i });
    this.confirmBtn = page.getByTestId('admin-confirm-btn');
    this.cancelBtn = page.getByTestId('admin-cancel-btn');
    this.reasonInput = page.getByTestId('admin-reason-input').locator('textarea, input').first();
  }

  /**
   * Điều hướng vào trang Xác thực Doanh nghiệp
   */
  async gotoVerifications() {
    await this.goto('/admin/company-verifications');
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận danh sách yêu cầu xác thực tải thành công
   */
  async expectVerificationsLoaded() {
    await expect(this.tableRows.first()).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Tìm hàng chứa tên doanh nghiệp cụ thể
   */
  getCompanyRow(companyName: string): Locator {
    return this.tableRows.filter({ hasText: companyName }).first();
  }

  /**
   * Kiểm tra thông tin doanh nghiệp và mã số thuế hiển thị trên bảng
   */
  async expectCompanyInTable(companyName: string, taxCode?: string) {
    const row = this.getCompanyRow(companyName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    if (taxCode) {
      await expect(row.getByText(taxCode).first()).toBeVisible({ timeout: 10_000 });
    }
  }

  /**
   * Kiểm tra và xem tài liệu giấy phép kinh doanh (GPKD)
   * Trả về URL liên kết tài liệu để kiểm chứng tính toàn vẹn
   */
  async viewLicenseFile(companyName?: string): Promise<string | null> {
    const row = companyName ? this.getCompanyRow(companyName) : this.tableRows.first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const licenseBtn = row.getByRole('link', { name: /xem giấy phép/i })
      .or(row.getByRole('button', { name: /xem giấy phép/i }))
      .or(row.locator('a:has-text("Xem giấy phép")'))
      .first();

    await expect(licenseBtn).toBeVisible({ timeout: 10_000 });
    const href = await licenseBtn.getAttribute('href');
    return href;
  }

  /**
   * Phê duyệt cấp huy hiệu Tích xanh xác thực cho doanh nghiệp
   */
  async verifyCompany(companyName?: string) {
    const row = companyName ? this.getCompanyRow(companyName) : this.tableRows.first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const approveBtn = row.getByTestId('approve-verification-btn').first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });
    await approveBtn.click();

    // Xác nhận trên modal
    await expect(this.confirmBtn).toBeVisible({ timeout: 10_000 });
    await this.confirmBtn.click();
    await expect(this.confirmBtn).toBeHidden({ timeout: 10_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Từ chối yêu cầu xác thực doanh nghiệp kèm lý do
   */
  async rejectCompany(companyName: string | undefined, reason: string) {
    const row = companyName ? this.getCompanyRow(companyName) : this.tableRows.first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const rejectBtn = row.getByTestId('reject-verification-btn').first();
    await expect(rejectBtn).toBeVisible({ timeout: 10_000 });
    await rejectBtn.click();

    // Điền lý do từ chối
    await expect(this.reasonInput).toBeVisible({ timeout: 10_000 });
    await this.reasonInput.fill(reason);

    // Xác nhận từ chối
    await expect(this.confirmBtn).toBeVisible({ timeout: 10_000 });
    await this.confirmBtn.click();
    await expect(this.confirmBtn).toBeHidden({ timeout: 10_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm chứng huy hiệu Tích xanh đã xác thực (Verified Badge) hiển thị
   */
  async expectVerifiedBadge(companyName: string) {
    const row = this.getCompanyRow(companyName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    const verifiedBadge = row.locator('.MuiChip-root, span').filter({ hasText: /đã xác thực|verified/i }).first();
    await expect(verifiedBadge).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Kiểm chứng trạng thái bị từ chối xác thực hiển thị
   */
  async expectRejectedBadge(companyName: string) {
    const row = this.getCompanyRow(companyName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    const rejectedBadge = row.locator('.MuiChip-root, span').filter({ hasText: /bị từ chối|rejected/i }).first();
    await expect(rejectedBadge).toBeVisible({ timeout: 10_000 });
  }
}
