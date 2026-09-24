import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * JobSearchPage - Page Object Model cho trang danh sách và tìm kiếm việc làm (/jobs)
 * Phục vụ các kịch bản CAND-01, CAND-02, CAND-12
 */
export class JobSearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly advancedFilterButton: Locator;
  readonly applyFilterButton: Locator;
  readonly resetFilterButton: Locator;
  readonly careerSelect: Locator;
  readonly citySelect: Locator;
  readonly jobCards: Locator;
  readonly noDataCard: Locator;
  readonly searchResultsCountHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[name="kw"], input[placeholder*="Tìm kiếm"]').first();
    this.searchButton = page.getByRole('button', { name: /tìm kiếm/i }).first();
    this.advancedFilterButton = page.getByRole('button', { name: /bộ lọc nâng cao/i }).first();
    this.applyFilterButton = page.getByRole('button', { name: /áp dụng/i }).first();
    this.resetFilterButton = page.getByRole('button', { name: /đặt lại/i }).first();
    this.careerSelect = page.locator('input[name="careerId"], [data-testid="career-select"]').first();
    this.citySelect = page.locator('input[name="cityId"], [data-testid="city-select"]').first();
    this.jobCards = page.locator('[data-tour="job-card"], [class*="JobPostLarge"], [data-testid="job-card"]');
    this.noDataCard = page.locator('[data-testid="no-data"], .no-data-card, [class*="NoDataCard"]').first();
    this.searchResultsCountHeading = page.locator('h1, h5').filter({ hasText: /kết quả tìm kiếm/i }).first();
  }

  /**
   * Điều hướng tới trang /jobs với tham số tùy chọn
   */
  async goto(queryParams?: string) {
    const url = queryParams ? `/jobs?${queryParams}` : '/jobs';
    await super.goto(url);
    await this.waitForLoadingGone();
  }

  /**
   * Nhập từ khóa tìm kiếm và bấm nút Tìm kiếm
   */
  async searchKeyword(keyword: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 15_000 });
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForLoadingGone();
  }

  /**
   * Mở Drawer bộ lọc nâng cao
   */
  async openAdvancedFilters() {
    await expect(this.advancedFilterButton).toBeVisible({ timeout: 10_000 });
    await this.advancedFilterButton.click();
  }

  /**
   * Bấm áp dụng bộ lọc trong Drawer
   */
  async applyAdvancedFilters() {
    await expect(this.applyFilterButton).toBeVisible({ timeout: 10_000 });
    await this.applyFilterButton.click();
    await this.waitForLoadingGone();
  }

  /**
   * Đặt lại bộ lọc về mặc định
   */
  async resetFilters() {
    if (await this.resetFilterButton.isVisible()) {
      await this.resetFilterButton.click();
      await this.waitForLoadingGone();
    }
  }

  /**
   * Đếm số lượng thẻ công việc đang hiển thị
   */
  async getJobCardsCount(): Promise<number> {
    return await this.jobCards.count();
  }

  /**
   * Kiểm tra một công việc cụ thể có hiển thị trên danh sách
   */
  async expectJobVisible(jobName: string | RegExp) {
    const jobElement = this.page.getByText(jobName).first();
    await expect(jobElement).toBeVisible({ timeout: 20_000 });
    return jobElement;
  }

  /**
   * Kiểm tra trạng thái rỗng (Empty State) khi không tìm thấy công việc
   */
  async expectEmptyState() {
    const emptyNotice = this.page
      .getByText(/không tìm thấy|không có việc làm|chưa có việc làm/i)
      .or(this.noDataCard);
    await expect(emptyNotice.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Kiểm tra thông báo hoặc trạng thái khi mất kết nối mạng
   */
  async expectOfflineState() {
    const offlineIndicator = this.page
      .getByText(/không có kết nối mạng|mất kết nối|lỗi kết nối|network error/i)
      .or(this.noDataCard);
    await expect(offlineIndicator.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Bấm nút Thử lại khi có mạng
   */
  async clickRetry() {
    const retryButton = this.page
      .getByRole('button', { name: /thử lại|tìm lại/i })
      .or(this.searchButton)
      .first();
    await expect(retryButton).toBeVisible({ timeout: 10_000 });
    await retryButton.click();
    await this.waitForLoadingGone();
  }
}
