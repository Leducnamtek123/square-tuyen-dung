import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * AdminDashboardPage - Page Object cho Trung tâm Quản trị Cấp cao (Admin Dashboard)
 * Đường dẫn: /admin/dashboard (hoặc /admin)
 */
export class AdminDashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly refreshBtn: Locator;

  // Thẻ KPI / Thống kê vận hành hệ thống
  readonly totalUsersCard: Locator;
  readonly jobPostsCard: Locator;
  readonly applicationsCard: Locator;
  readonly companiesCard: Locator;
  readonly interviewsCard: Locator;

  // Điều hướng phân hệ quản trị
  readonly jobsNav: Locator;
  readonly verificationsNav: Locator;
  readonly usersNav: Locator;
  readonly careersNav: Locator;
  readonly auditLogsNav: Locator;
  readonly settingsNav: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByText(/dữ liệu vận hành|operating|bảng điều khiển/i).first();
    this.refreshBtn = page.getByRole('button', { name: /làm mới|refresh/i }).first();

    this.totalUsersCard = page.locator('div, .MuiCard-root, .MuiPaper-root').filter({ hasText: /tổng người dùng|người dùng/i }).first();
    this.jobPostsCard = page.locator('div, .MuiCard-root, .MuiPaper-root').filter({ hasText: /tình trạng tin tuyển dụng|tin tuyển dụng/i }).first();
    this.applicationsCard = page.locator('div, .MuiCard-root, .MuiPaper-root').filter({ hasText: /quy trình ứng tuyển|ứng tuyển/i }).first();
    this.companiesCard = page.locator('div, .MuiCard-root, .MuiPaper-root').filter({ hasText: /công ty|doanh nghiệp/i }).first();
    this.interviewsCard = page.locator('div, .MuiCard-root, .MuiPaper-root').filter({ hasText: /phỏng vấn/i }).first();

    this.jobsNav = page.locator('a[href*="/admin/jobs"], a[href*="/quan-tri/tin-tuyen-dung"]').first();
    this.verificationsNav = page.locator('a[href*="/admin/company-verifications"], a[href*="/quan-tri/xac-thuc-doanh-nghiep"]').first();
    this.usersNav = page.locator('a[href*="/admin/users"], a[href*="/quan-tri/nguoi-dung"]').first();
    this.careersNav = page.locator('a[href*="/admin/careers"], a[href*="/quan-tri/nganh-nghe"]').first();
    this.auditLogsNav = page.locator('a[href*="/admin/audit-logs"], a[href*="/quan-tri/nhat-ky-kiem-toan"]').first();
    this.settingsNav = page.locator('a[href*="/admin/settings"], a[href*="/quan-tri/cai-dat"]').first();
  }

  /**
   * Điều hướng vào Dashboard Quản trị viên
   */
  async gotoDashboard() {
    await this.goto('/admin');
    await this.page.waitForURL(/\/(admin|quan-tri)\/(dashboard|bang-dieu-khien)?/, { timeout: 25_000 });
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra giao diện Dashboard hiển thị đầy đủ tiêu đề và các chỉ số KPI
   */
  async expectDashboardLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 20_000 });
    await expect(this.refreshBtn).toBeVisible({ timeout: 15_000 });
    await expect(this.totalUsersCard).toBeVisible({ timeout: 15_000 });
    await expect(this.jobPostsCard).toBeVisible({ timeout: 15_000 });
    await expect(this.companiesCard).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Bấm nút làm mới dữ liệu
   */
  async clickRefresh() {
    await this.refreshBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Điều hướng nhanh tới các phân hệ quản trị
   */
  async navigateTo(section: 'jobs' | 'verifications' | 'users' | 'careers' | 'audit-logs' | 'settings') {
    switch (section) {
      case 'jobs':
        await this.jobsNav.click();
        await this.page.waitForURL(/\/admin\/jobs/, { timeout: 15_000 });
        break;
      case 'verifications':
        await this.verificationsNav.click();
        await this.page.waitForURL(/\/admin\/company-verifications/, { timeout: 15_000 });
        break;
      case 'users':
        await this.usersNav.click();
        await this.page.waitForURL(/\/admin\/users/, { timeout: 15_000 });
        break;
      case 'careers':
        await this.careersNav.click();
        await this.page.waitForURL(/\/admin\/careers/, { timeout: 15_000 });
        break;
      case 'audit-logs':
        await this.auditLogsNav.click();
        await this.page.waitForURL(/\/admin\/audit-logs/, { timeout: 15_000 });
        break;
      case 'settings':
        await this.settingsNav.click();
        await this.page.waitForURL(/\/admin\/settings/, { timeout: 15_000 });
        break;
    }
    await this.waitForLoadingGone();
  }
}
