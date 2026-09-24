import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface JobPostFormData {
  jobName: string;
  careerId?: number;
  cityId?: number;
  salaryMin?: string | number;
  salaryMax?: string | number;
  quantity?: string | number;
  deadline?: string;
  jobDescription?: string;
  jobRequirement?: string;
  benefits?: string;
}

/**
 * JobPostEditorPage - Page Object Model quản lý vòng đời tin tuyển dụng
 * Hỗ trợ các kịch bản: EMP-01 (Tạo tin rich-text JD), EMP-02 (Đóng / Mở lại tin), EMP-11 (Hạn mức đăng tin)
 */
export class JobPostEditorPage extends BasePage {
  // Trang danh sách tin (/employer/job-posts)
  readonly createJobBtn: Locator;
  readonly jobPostsTable: Locator;
  readonly jobTableRows: Locator;
  readonly searchInput: Locator;
  readonly statusFilterSelect: Locator;

  // Form đăng tin (/employer/job-posts/create & /edit)
  readonly jobTitleInput: Locator;
  readonly quantityInput: Locator;
  readonly salaryMinInput: Locator;
  readonly salaryMaxInput: Locator;
  readonly deadlineInput: Locator;
  readonly careerSelect: Locator;
  readonly citySelect: Locator;
  readonly richTextEditor: Locator;
  readonly submitJobBtn: Locator;

  // Quota Exceeded Modal / Alert
  readonly quotaAlert: Locator;
  readonly quotaUpgradeModal: Locator;
  readonly pricingLink: Locator;

  // Dialog xác nhận xóa / đóng tin
  readonly confirmModal: Locator;
  readonly confirmModalBtn: Locator;
  readonly cancelModalBtn: Locator;

  constructor(page: Page) {
    super(page);

    // List elements
    this.createJobBtn = page.locator('button, a').filter({ hasText: /tạo tin|đăng tin|thêm tin/i }).first();
    this.jobPostsTable = page.locator('table, [role="table"], [class*="DataTable"]').first();
    this.jobTableRows = page.locator('tbody tr');
    this.searchInput = page.locator('input[placeholder*="Tìm kiếm"], input[name="kw"]').first();
    this.statusFilterSelect = page.locator('input[name="statusId"], [data-testid="status-select"]').first();

    // Form elements
    this.jobTitleInput = page.locator('input#jobName, input[name="jobName"]').first();
    this.quantityInput = page.locator('input#quantity, input[name="quantity"]').first();
    this.salaryMinInput = page.locator('input#salaryMin, input[name="salaryMin"]').first();
    this.salaryMaxInput = page.locator('input#salaryMax, input[name="salaryMax"]').first();
    this.deadlineInput = page.locator('input[placeholder*="DD/MM/YYYY"], input[name="deadline"]').first();
    this.careerSelect = page.locator('#career, input[name="career"], [data-testid="career-select"]').first();
    this.citySelect = page.locator('#city, input[name="city"], [data-testid="city-select"]').first();
    this.richTextEditor = page.locator('.public-DraftEditor-content, [contenteditable="true"], .rdw-editor-main').first();
    this.submitJobBtn = page.locator('button[type="submit"], button').filter({ hasText: /đăng tin|lưu|cập nhật|tạo tin/i }).first();

    // Quota alert & pricing
    this.quotaAlert = page.locator('.MuiAlert-standardWarning, [role="alert"]').filter({ hasText: /hạn mức|nâng cấp|gói dịch vụ|xác thực/i }).first();
    this.quotaUpgradeModal = page.locator('.MuiDialog-root, [role="dialog"]').filter({ hasText: /hạn mức|nâng cấp gói|bảng giá/i }).first();
    this.pricingLink = page.locator('a[href*="/pricing"], a[href*="/bao-gia"]').first();

    // SweetAlert2 / Confirm Modal
    this.confirmModal = page.locator('.swal2-modal, [role="dialog"]').first();
    this.confirmModalBtn = page.locator('.swal2-confirm, button:has-text("Xác nhận"), button:has-text("Đồng ý")').first();
    this.cancelModalBtn = page.locator('.swal2-cancel, button:has-text("Hủy")').first();
  }

  /**
   * Điều hướng tới danh sách tin tuyển dụng
   */
  async gotoList() {
    await super.goto('/employer/job-posts');
    await this.waitForLoadingGone();
  }

  /**
   * Điều hướng tới trang tạo tin tuyển dụng mới
   */
  async gotoCreate() {
    await super.goto('/employer/job-posts/create');
    await this.waitForLoadingGone();
  }

  /**
   * Điều hướng tới trang chỉnh sửa tin tuyển dụng
   */
  async gotoEdit(slugOrId: string | number) {
    await super.goto(`/employer/job-posts/${slugOrId}/edit`);
    await this.waitForLoadingGone();
  }

  /**
   * Điền thông tin form tuyển dụng đầy đủ (hỗ trợ rich-text JD)
   */
  async fillJobPostForm(data: JobPostFormData) {
    if (data.jobName) {
      await expect(this.jobTitleInput).toBeVisible({ timeout: 15_000 });
      await this.jobTitleInput.fill(data.jobName);
    }

    if (data.quantity && (await this.quantityInput.isVisible())) {
      await this.quantityInput.fill(String(data.quantity));
    }

    if (data.salaryMin && (await this.salaryMinInput.isVisible())) {
      await this.salaryMinInput.fill(String(data.salaryMin));
    }

    if (data.salaryMax && (await this.salaryMaxInput.isVisible())) {
      await this.salaryMaxInput.fill(String(data.salaryMax));
    }

    if (data.deadline && (await this.deadlineInput.isVisible())) {
      await this.deadlineInput.fill(data.deadline);
    }

    // Rich text editor điền nội dung mô tả JD
    if (data.jobDescription && (await this.richTextEditor.isVisible())) {
      await this.richTextEditor.click();
      await this.page.keyboard.type(data.jobDescription);
    }
  }

  /**
   * Nhấn nút Đăng tin / Lưu thay đổi
   */
  async submitJob() {
    await expect(this.submitJobBtn).toBeVisible({ timeout: 15_000 });
    await this.submitJobBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Đóng tin tuyển dụng từ danh sách
   */
  async closeJobPost(jobNameOrId: string | number) {
    await this.gotoList();
    const row = this.page.locator('tr').filter({ hasText: String(jobNameOrId) }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const deleteBtn = row.locator('button[aria-label*="Xóa"], button:has([data-testid="DeleteIcon"])').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();

    // Chờ modal xác nhận xuất hiện và bấm Đồng ý
    if (await this.confirmModalBtn.isVisible({ timeout: 5_000 })) {
      await this.confirmModalBtn.click();
    }
    await this.waitForLoadingGone();
  }

  /**
   * Mở lại / kích hoạt lại tin tuyển dụng đã đóng
   */
  async reopenJobPost(slugOrId: string | number, newDeadline = '30/12/2026') {
    await this.gotoEdit(slugOrId);
    if (await this.deadlineInput.isVisible()) {
      await this.deadlineInput.fill(newDeadline);
    }
    await this.submitJob();
  }

  /**
   * Kiểm tra thông báo lỗi validation trên form
   */
  async expectValidationError(message?: string | RegExp) {
    const errorMsg = message
      ? this.page.locator('.Mui-error, [class*="ValidationError"], .text-red-500').filter({ hasText: message }).first()
      : this.page.locator('.Mui-error, [class*="ValidationError"]').first();
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Kiểm tra xuất hiện cảnh báo / modal hết hạn mức đăng tin (Quota Exceeded)
   */
  async expectQuotaModalOrAlert() {
    const quotaIndicator = this.quotaUpgradeModal.or(this.quotaAlert).first();
    await expect(quotaIndicator).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Kiểm tra tin xuất hiện trong bảng danh sách tin
   */
  async expectJobInList(jobTitle: string) {
    await this.gotoList();
    const jobItem = this.page.getByText(jobTitle).first();
    await expect(jobItem).toBeVisible({ timeout: 15_000 });
  }
}
