import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_EMPLOYER_STATS } from '../../mocks';
import { setupDomainEmployerMocks } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { EmployerDashboardPage } from '../../pages/employer/employer-dashboard.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Bảng Điều Khiển & Chỉ Số Tuyển Dụng (Employer Dashboard & KPIs)', () => {
  let dashboardPage: EmployerDashboardPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Bỏ qua product tour nếu có
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_employer_dashboard', 'true');
      } catch {}
    });

    dashboardPage = new EmployerDashboardPage(page);
  });

  /**
   * EMP-05: Hiển thị đúng 4 thẻ số liệu KPI tuyển dụng và biểu đồ tổng quan
   */
  test('EMP-05: Render full KPI metric cards and analytics charts on dashboard', async ({ page }) => {
    await dashboardPage.goto();

    // 1. Kiểm tra 4 thẻ KPI thống kê hiển thị đầy đủ
    await dashboardPage.expectKpisRendered();

    const stats = await dashboardPage.getKpiStats();
    expect(Number(stats.jobPosts)).toBeGreaterThanOrEqual(0);
    expect(Number(stats.applications)).toBeGreaterThanOrEqual(0);

    // 2. Kiểm tra biểu đồ tuyển dụng render thành công không lỗi canvas
    await dashboardPage.expectChartsRendered();

    // 3. Kiểm tra widget "Ứng viên mới nộp hồ sơ" hiển thị bản ghi ứng viên
    const applicants = await dashboardPage.getRecentApplicantNames();
    expect(applicants.length).toBeGreaterThan(0);
  });

  /**
   * EMP-05 Edge Case: Xử lý dữ liệu rỗng (công ty mới thành lập chưa có tin/ứng viên)
   */
  test('EMP-05 Edge Case: Gracefully render KPI cards with zero values when company has empty statistics', async ({ page }) => {
    // Override endpoint trả về số liệu 0
    await page.route(/\/job\/web\/statistics\/employer\/?(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalJobPost: 0,
          totalJobPostingPendingApproval: 0,
          totalJobPostExpired: 0,
          totalApply: 0,
          totalFollowers: 0,
          totalSavedProfiles: 0,
          totalInterviews: 0,
          totalInterviewsCompleted: 0,
          totalInterviewsInProgress: 0,
          conversionRate: 0,
          avgAiOverallScore: 0,
        }),
      });
    });

    await dashboardPage.goto();
    await dashboardPage.expectKpisRendered();

    const stats = await dashboardPage.getKpiStats();
    expect(stats.jobPosts).toBe('0');
    expect(stats.applications).toBe('0');
  });

  /**
   * EMP-05 Interaction: Thao tác làm mới dữ liệu và thay đổi khoảng thời gian
   */
  test('EMP-05: Refresh dashboard and toggle reporting period', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectKpisRendered();

    // Bấm nút làm mới
    await dashboardPage.refreshDashboard();
    await dashboardPage.expectKpisRendered();

    // Đổi khoảng thời gian thống kê sang 7 ngày
    await dashboardPage.changePeriod(7);
    await dashboardPage.expectKpisRendered();
  });
});
