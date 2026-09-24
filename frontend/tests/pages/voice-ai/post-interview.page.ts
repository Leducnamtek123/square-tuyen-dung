import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * PostInterviewPage - Page Object quản lý màn hình kết thúc phỏng vấn và bảng điểm AI (InterviewCompletedView)
 * Đóng gói việc kiểm tra tiến trình phân tích kết quả, điểm số tổng thể, điểm mạnh/yếu, và guard chống thi lại
 */
export class PostInterviewPage extends BasePage {
  readonly titleHeader: Locator;
  readonly processingBanner: Locator;
  readonly overallScoreBadge: Locator;
  readonly radarChart: Locator;
  readonly strengthsSection: Locator;
  readonly weaknessesSection: Locator;
  readonly videoPlayer: Locator;
  readonly backHomeBtn: Locator;
  readonly shareBtn: Locator;
  readonly retryPracticeBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('h1, h2, span, button').filter({
      hasText: /kết quả phỏng vấn|kết quả luyện tập|báo cáo luyện tập aila/i,
    });
    this.processingBanner = page.locator('div').filter({
      hasText: /đang xử lý và tổng hợp|đang phân tích|đang tổng hợp/i,
    });
    this.overallScoreBadge = page.locator('div, span, p').filter({
      hasText: /điểm tổng thể|overall|tổng điểm/i,
    });
    this.radarChart = page.locator('svg, canvas, [class*="radar"], [data-testid="radar-chart"]').first();
    this.strengthsSection = page.locator('div, p, h3, h4').filter({
      hasText: /điểm mạnh nổi bật|điểm mạnh/i,
    });
    this.weaknessesSection = page.locator('div, p, h3, h4').filter({
      hasText: /khu vực cần cải thiện|điểm cần cải thiện|điểm yếu/i,
    });
    this.videoPlayer = page.locator('video, [class*="video"], div:has-text("Bản ghi video")');
    this.backHomeBtn = page.getByRole('button', { name: /về trang chủ|trang chủ/i });
    this.shareBtn = page.getByRole('button', { name: /chia sẻ|share/i });
    this.retryPracticeBtn = page.getByRole('button', { name: /luyện tập lại|thử lại/i });
  }

  /**
   * Điều hướng tới link phỏng vấn theo token
   */
  async gotoInterview(token: string) {
    await this.goto(`/interview/${token}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Chờ thanh tiến trình xử lý sau phỏng vấn
   */
  async waitForAnalysisProgress(timeout = 15_000) {
    const indicator = this.processingBanner.or(this.titleHeader);
    await expect(indicator.first()).toBeVisible({ timeout });
  }

  /**
   * Xác nhận trang đã ở trạng thái hoàn thành (Completed)
   */
  async expectCompletedState(timeout = 20_000) {
    await expect(this.titleHeader.first()).toBeVisible({ timeout });
  }

  /**
   * Xác nhận hiển thị điểm tổng thể và phân tích năng lực
   */
  async expectScores() {
    await expect(this.overallScoreBadge.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Xác nhận hiển thị danh sách điểm mạnh và điểm yếu từ AI
   */
  async expectFeedbackStrengthsWeaknesses() {
    await expect(this.strengthsSection.first()).toBeVisible({ timeout: 15_000 });
    await expect(this.weaknessesSection.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Guard chống thi lại: Xác nhận phiên đã kết thúc và không xuất hiện nút bắt đầu hoặc phòng gọi mới
   */
  async expectCompletedSessionGuard() {
    await this.expectCompletedState();
    const joinBtn = this.page.getByTestId('join-interview-room-btn');
    const startBtn = this.page.getByTestId('start-interview-btn');
    await expect(joinBtn).toHaveCount(0);
    await expect(startBtn).toHaveCount(0);
  }
}
