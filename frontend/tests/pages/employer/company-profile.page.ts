import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface CompanyUpdateData {
  companyName?: string;
  taxCode?: string;
  employeeSize?: number;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
}

export interface LegalProfileData {
  companyName?: string;
  taxCode?: string;
  representative?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * CompanyProfilePage - Page Object Model quản lý hồ sơ doanh nghiệp & xác minh GPKD
 * Phục vụ kiểm thử EMP-10: Cập nhật thông tin công ty và gửi tài liệu GPKD cấp tích xanh
 */
export class CompanyProfilePage extends BasePage {
  // Trang thông tin công ty (/employer/company)
  readonly companyNameInput: Locator;
  readonly taxCodeInput: Locator;
  readonly employeeSizeInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly saveCompanyBtn: Locator;

  // Trang xác minh pháp lý GPKD (/employer/verification)
  readonly verificationForm: Locator;
  readonly licenseFileInput: Locator;
  readonly licenseDropzone: Locator;
  readonly representativeInput: Locator;
  readonly submitVerificationBtn: Locator;
  readonly verificationStatusChip: Locator;

  constructor(page: Page) {
    super(page);

    // Company info form elements
    this.companyNameInput = page.locator('input[name="companyName"], input#companyName').first();
    this.taxCodeInput = page.locator('input[name="taxCode"], input#taxCode').first();
    this.employeeSizeInput = page.locator('input[name="employeeSize"], [role="combobox"]').first();
    this.phoneInput = page.locator('input[name="companyPhone"], input[name="phone"]').first();
    this.emailInput = page.locator('input[name="companyEmail"], input[name="email"]').first();
    this.addressInput = page.locator('input[name="address"], input[placeholder*="địa chỉ"]').first();
    this.saveCompanyBtn = page.getByRole('button', { name: /lưu thay đổi|cập nhật/i }).first();

    // Verification elements
    this.verificationForm = page.locator('form, [class*="VerificationLegalProfileForm"]').first();
    this.licenseFileInput = page.locator('input[type="file"]');
    this.licenseDropzone = page.locator('text=/nhấp để tải lên|tài liệu pháp lý|gpkd/i').first();
    this.representativeInput = page.locator('input[placeholder*="đại diện"], label:has-text("đại diện") + div input').first();
    this.submitVerificationBtn = page.locator('button[type="submit"]').filter({ hasText: /lưu|gửi yêu cầu/i }).first();
    this.verificationStatusChip = page.locator('[class*="MuiChip-root"]').filter({ hasText: /chờ duyệt|đã xác minh|từ chối|đang duyệt/i }).first();
  }

  /**
   * Điều hướng tới trang Thông tin công ty
   */
  async gotoCompany() {
    await super.goto('/employer/company');
    await this.waitForLoadingGone();
  }

  /**
   * Điều hướng tới trang Xác minh doanh nghiệp GPKD
   */
  async gotoVerification() {
    await super.goto('/employer/verification');
    await this.waitForLoadingGone();
  }

  /**
   * Cập nhật thông tin cơ bản của doanh nghiệp
   */
  async updateCompanyInfo(data: CompanyUpdateData) {
    await this.gotoCompany();

    if (data.companyName && (await this.companyNameInput.isVisible())) {
      await this.companyNameInput.fill(data.companyName);
    }
    if (data.phone && (await this.phoneInput.isVisible())) {
      await this.phoneInput.fill(data.phone);
    }
    if (data.address && (await this.addressInput.isVisible())) {
      await this.addressInput.fill(data.address);
    }

    if (await this.saveCompanyBtn.isVisible()) {
      await this.saveCompanyBtn.click();
      await this.waitForLoadingGone();
    }
  }

  /**
   * Tải file giấy phép kinh doanh (GPKD)
   */
  async uploadBusinessLicense(filePath: string) {
    await this.gotoVerification();
    await this.licenseFileInput.first().setInputFiles(filePath);
    await this.waitForLoadingGone();
  }

  /**
   * Gửi hồ sơ pháp lý xác thực doanh nghiệp
   */
  async submitVerification(data?: LegalProfileData) {
    await this.gotoVerification();

    if (data?.representative && (await this.representativeInput.isVisible())) {
      await this.representativeInput.fill(data.representative);
    }

    await expect(this.submitVerificationBtn).toBeVisible({ timeout: 10_000 });
    await this.submitVerificationBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra huy hiệu / trạng thái xác minh hiển thị đúng
   */
  async expectVerificationStatus(pattern: string | RegExp) {
    const statusText = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    const badge = this.page.locator('.MuiChip-root, [class*="status"]').filter({ hasText: statusText }).first();
    await expect(badge).toBeVisible({ timeout: 15_000 });
  }
}
