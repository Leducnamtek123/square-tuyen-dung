import { expect, type Page, type Locator } from '@playwright/test';

/**
 * BasePage - Lớp nền tảng cho mọi Page Object Model trong hệ thống InfoHR
 * Cung cấp các tiện ích xử lý điều hướng, chờ tải, kiểm tra toast và modal dùng chung
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Điều hướng an toàn tới đường dẫn tương đối
   */
  async goto(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Chờ tất cả hiệu ứng quay nạp dữ liệu (Spinner/Skeleton) biến mất
   */
  async waitForLoadingGone(timeout = 15_000) {
    const loadingIndicators = this.page.locator(
      '[data-testid="loading-spinner"], [data-testid="skeleton-loader"], .MuiCircularProgress-root, .animate-spin'
    );
    try {
      if (await loadingIndicators.first().isVisible({ timeout: 1000 })) {
        await loadingIndicators.first().waitFor({ state: 'hidden', timeout });
      }
    } catch {
      // Bỏ qua nếu không xuất hiện spinner
    }
  }

  /**
   * Kiểm tra thông báo Toast (Sonner, MUI Alert hoặc toast custom) xuất hiện
   */
  async expectToastMessage(message: string | RegExp, timeout = 10_000) {
    const toast = this.page
      .locator('[role="alert"], [data-sonner-toast], .MuiAlert-message, .Toastify__toast-body')
      .filter({ hasText: message })
      .first();
    await expect(toast).toBeVisible({ timeout });
    return toast;
  }

  /**
   * Đóng hộp thoại Dialog/Modal nếu đang hiển thị
   */
  async closeModalIfOpen() {
    const closeButtons = this.page.locator(
      'button[aria-label="close"], button[aria-label="Close"], [data-testid="close-modal-btn"], button:has-text("Đóng")'
    );
    if (await closeButtons.first().isVisible({ timeout: 1000 })) {
      await closeButtons.first().click();
    }
  }

  /**
   * Kiểm tra tiêu đề trang
   */
  async expectHeading(title: string | RegExp, level?: 1 | 2 | 3 | 4 | 5 | 6) {
    const heading = this.page.getByRole('heading', { name: title, level });
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
    return heading.first();
  }

  /**
   * Chụp ảnh màn hình lưu vết khi cần
   */
  async takeScreenshot(name: string) {
    return await this.page.screenshot({ path: `playwright-report/screenshots/${name}.png`, fullPage: true });
  }
}
