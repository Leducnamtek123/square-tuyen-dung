import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * EmployerDashboardPage - Page Object Model cho bảng điều khiển nhà tuyển dụng (/employer/dashboard)
 * Phục vụ kiểm thử EMP-05 và theo dõi các chỉ số KPI tuyển dụng thời gian thực
 */
export class EmployerDashboardPage extends BasePage {
  readonly dashboardContainer: Locator;
  readonly refreshBtn: Locator;
  readonly periodToggleGroup: Locator;

  // KPI Metric Cards
  readonly applicationsCard: Locator;
  readonly jobPostsCard: Locator;
  readonly interviewsCard: Locator;
  readonly conversionCard: Locator;

  // Recent Applications Widget
  readonly recentApplicationsWidget: Locator;
  readonly recentCandidateItems: Locator;
  readonly viewAllApplicationsBtn: Locator;

  // Charts
  readonly recruitmentChart: Locator;
  readonly candidateChart: Locator;
  readonly applicationChart: Locator;
  readonly interviewStatsChart: Locator;

  constructor(page: Page) {
    super(page);

    this.dashboardContainer = page.locator('main, [class*="DashboardPage"], [class*="gsap-emp-header"]').first();
    this.refreshBtn = page.getByRole('button', { name: /làm mới|cập nhật/i }).or(page.locator('button:has([data-testid="RefreshIcon"])')).first();
    this.periodToggleGroup = page.locator('.MuiToggleButtonGroup-root').first();

    // 4 KPI Cards in EmployerQuantityStatistics
    this.applicationsCard = page.locator('.MuiPaper-root').filter({ hasText: /hồ sơ ứng tuyển|tổng hồ sơ/i }).first();
    this.jobPostsCard = page.locator('.MuiPaper-root').filter({ hasText: /tin tuyển dụng|tổng tin đăng/i }).first();
    this.interviewsCard = page.locator('.MuiPaper-root').filter({ hasText: /phỏng vấn|lượt phỏng vấn/i }).first();
    this.conversionCard = page.locator('.MuiPaper-root').filter({ hasText: /tỷ lệ chuyển đổi|điểm ai/i }).first();

    // Recent Applications Widget
    this.recentApplicationsWidget = page.locator('.MuiPaper-root').filter({ hasText: /ứng viên mới nộp hồ sơ/i }).first();
    this.recentCandidateItems = this.recentApplicationsWidget.locator('.MuiStack-root > .MuiBox-root, [class*="MuiListItem"]');
    this.viewAllApplicationsBtn = this.recentApplicationsWidget.getByRole('link', { name: /xem tất cả/i }).or(this.recentApplicationsWidget.getByRole('button', { name: /xem tất cả/i })).first();

    // Charts
    this.recruitmentChart = page.locator('[class*="RecruitmentChart"], canvas').first();
    this.candidateChart = page.locator('[class*="CandidateChart"]').first();
    this.applicationChart = page.locator('[class*="ApplicationChart"]').first();
    this.interviewStatsChart = page.locator('[class*="InterviewStatsChart"]').first();
  }

  /**
   * Điều hướng tới trang Dashboard nhà tuyển dụng
   */
  async goto() {
    await super.goto('/employer/dashboard');
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra 4 thẻ KPI thống kê hiển thị đầy đủ
   */
  async expectKpisRendered() {
    await expect(this.applicationsCard).toBeVisible({ timeout: 15_000 });
    await expect(this.jobPostsCard).toBeVisible({ timeout: 15_000 });
    await expect(this.interviewsCard).toBeVisible({ timeout: 15_000 });
    await expect(this.conversionCard).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Đọc số liệu từ 4 thẻ KPI
   */
  async getKpiStats(): Promise<{
    applications: string;
    jobPosts: string;
    interviews: string;
    conversion: string;
  }> {
    await this.expectKpisRendered();

    const getCardValue = async (card: Locator) => {
      const heading = card.locator('h4, [class*="MuiTypography-h4"]').first();
      return (await heading.textContent())?.trim() || '0';
    };

    const applications = await getCardValue(this.applicationsCard);
    const jobPosts = await getCardValue(this.jobPostsCard);
    const interviews = await getCardValue(this.interviewsCard);
    const conversion = await getCardValue(this.conversionCard);

    return { applications, jobPosts, interviews, conversion };
  }

  /**
   * Lấy danh sách tên ứng viên trong widget Ứng viên mới nộp hồ sơ
   */
  async getRecentApplicantNames(): Promise<string[]> {
    await expect(this.recentApplicationsWidget).toBeVisible({ timeout: 15_000 });
    const count = await this.recentCandidateItems.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.recentCandidateItems.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /**
   * Bấm nút Làm mới dữ liệu bảng điều khiển
   */
  async refreshDashboard() {
    if (await this.refreshBtn.isVisible()) {
      await this.refreshBtn.click();
      await this.waitForLoadingGone();
    }
  }

  /**
   * Đổi khoảng thời gian thống kê (7, 30, hoặc 90 ngày)
   */
  async changePeriod(days: 7 | 30 | 90) {
    const toggleBtn = this.periodToggleGroup.getByRole('button', { name: new RegExp(`${days}\\s*ngày`, 'i') }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await this.waitForLoadingGone();
    }
  }

  /**
   * Xác thực biểu đồ render không bị lỗi
   */
  async expectChartsRendered() {
    const charts = this.page.locator('canvas, [class*="chart"], [class*="Chart"]');
    await expect(charts.first()).toBeVisible({ timeout: 15_000 });
  }
}
