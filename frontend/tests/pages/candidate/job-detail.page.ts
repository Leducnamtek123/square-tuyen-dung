import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * JobDetailPage - Page Object Model cho trang chi tiết tin tuyển dụng (/jobs/[slug])
 * Phục vụ các kịch bản CAND-03, CAND-04, CAND-05, CAND-11
 */
export class JobDetailPage extends BasePage {
  readonly jobTitleHeading: Locator;
  readonly companyNameElement: Locator;
  readonly salaryElement: Locator;
  readonly deadlineElement: Locator;
  readonly applyButton: Locator;
  readonly mobileStickyApplyButton: Locator;
  readonly bookmarkButton: Locator;
  readonly appliedBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.jobTitleHeading = page.getByRole('heading', { level: 1 }).or(page.locator('h1')).first();
    this.companyNameElement = page.locator('[data-testid="company-name"]').or(page.locator('h6, .company-name')).first();
    this.salaryElement = page.getByText(/triệu|thỏa thuận|lương/i).first();
    this.deadlineElement = page.getByText(/hạn nộp/i).first();
    this.applyButton = page
      .locator('button')
      .filter({ hasText: /nộp hồ sơ|ứng tuyển ngay|ứng tuyển/i })
      .first();
    this.mobileStickyApplyButton = page
      .locator('[data-sticky-bottom="true"] button, .job-detail-sticky-bar button')
      .first();
    this.bookmarkButton = page.locator('button').filter({ hasText: /lưu tin|đã lưu/i }).first();
    this.appliedBadge = page
      .locator('button:has-text("Đã ứng tuyển"), [data-testid="applied-badge"], span:has-text("Đã ứng tuyển")')
      .first();
  }

  /**
   * Mở trang chi tiết công việc theo slug
   */
  async goto(slug: string) {
    await super.goto(`/jobs/${slug}`);
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal ứng tuyển (hỗ trợ cả desktop button lẫn mobile sticky bar)
   */
  async openApplyModal() {
    if (await this.mobileStickyApplyButton.isVisible()) {
      await this.mobileStickyApplyButton.click();
    } else {
      await expect(this.applyButton).toBeVisible({ timeout: 15_000 });
      await this.applyButton.click();
    }
  }

  /**
   * Lưu / bỏ lưu tin tuyển dụng
   */
  async bookmarkJob() {
    await expect(this.bookmarkButton).toBeVisible({ timeout: 15_000 });
    await this.bookmarkButton.click();
  }

  /**
   * Lấy tiêu đề công việc hiển thị
   */
  async getJobTitle(): Promise<string> {
    await expect(this.jobTitleHeading).toBeVisible({ timeout: 15_000 });
    return (await this.jobTitleHeading.textContent()) || '';
  }

  /**
   * Xác nhận công ty hiển thị đúng
   */
  async expectCompanyVisible(companyName: string | RegExp) {
    await expect(this.page.getByText(companyName).first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Xác nhận badge Đã ứng tuyển xuất hiện
   */
  async expectAppliedBadge() {
    const badge = this.page
      .locator('button:has-text("Đã ứng tuyển"), span:has-text("Đã ứng tuyển")')
      .or(this.appliedBadge);
    await expect(badge.first()).toBeVisible({ timeout: 15_000 });
  }
}
