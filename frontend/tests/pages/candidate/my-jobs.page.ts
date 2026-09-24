import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * MyJobsPage - Page Object Model cho trang quản lý việc làm (/my-jobs)
 * Phục vụ kịch bản CAND-09
 */
export class MyJobsPage extends BasePage {
  readonly savedTab: Locator;
  readonly appliedTab: Locator;
  readonly notificationsTab: Locator;
  readonly appliedJobCards: Locator;
  readonly savedJobCards: Locator;

  constructor(page: Page) {
    super(page);
    this.savedTab = page.getByRole('tab', { name: /việc làm đã lưu/i });
    this.appliedTab = page.getByRole('tab', { name: /việc làm đã nộp|đã ứng tuyển/i });
    this.notificationsTab = page.getByRole('tab', { name: /thông báo việc làm/i });
    this.appliedJobCards = page.locator('[class*="JobPostAction"], .job-post-action');
    this.savedJobCards = page.locator('[class*="JobPostAction"], .job-post-action');
  }

  /**
   * Điều hướng vào trang Quản lý việc làm
   */
  async goto(tabOrPath?: 'saved' | 'applied' | string) {
    let target = '/my-jobs';
    if (tabOrPath === 'applied') {
      target = '/my-jobs?tab=2';
    } else if (tabOrPath === 'saved') {
      target = '/my-jobs?tab=1';
    } else if (typeof tabOrPath === 'string') {
      target = tabOrPath.startsWith('/') ? tabOrPath : `/my-jobs?${tabOrPath}`;
    }
    await super.goto(target);
    await this.waitForLoadingGone();
  }

  /**
   * Chuyển tab giữa Đã lưu và Đã ứng tuyển
   */
  async switchTab(tab: 'saved' | 'applied') {
    if (tab === 'applied') {
      await expect(this.appliedTab).toBeVisible({ timeout: 15_000 });
      await this.appliedTab.click();
    } else {
      await expect(this.savedTab).toBeVisible({ timeout: 15_000 });
      await this.savedTab.click();
    }
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra công việc hiển thị trong danh sách Đã ứng tuyển
   */
  async expectJobInAppliedList(jobTitle: string | RegExp) {
    await this.switchTab('applied');
    const jobElement = this.page.getByText(jobTitle).first();
    await expect(jobElement).toBeVisible({ timeout: 20_000 });
    return jobElement;
  }

  /**
   * Kiểm tra badge trạng thái ứng tuyển (Chờ xác nhận, Phù hợp, Phỏng vấn, Từ chối, Ứng tuyển vào...)
   */
  async expectJobStatusBadge(statusText: string | RegExp) {
    const badge = this.page.getByText(statusText).first();
    await expect(badge).toBeVisible({ timeout: 15_000 });
    return badge;
  }

  /**
   * Hủy lưu một công việc đã lưu
   */
  async unsaveJob(jobTitle: string | RegExp) {
    await this.switchTab('saved');
    const card = this.page
      .locator('[class*="JobPostAction"], .job-post-action, .MuiCard-root')
      .filter({ hasText: jobTitle })
      .first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    const unsaveButton = card
      .locator('button')
      .filter({ hasText: /lưu|bỏ lưu|đã lưu/i })
      .or(card.locator('button[aria-label*="save"], button[aria-label*="favorite"], svg[data-testid="FavoriteIcon"]'))
      .first();
    await unsaveButton.click();
    await this.waitForLoadingGone();
  }
}
