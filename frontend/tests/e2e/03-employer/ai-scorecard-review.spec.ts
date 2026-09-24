import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainEmployerMocks, MOCK_INTERVIEW_DETAIL_COMPLETED } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { AiScorecardPage } from '../../pages/employer/ai-scorecard.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Bảng Điểm Đánh Giá AI Scorecard (AI Scorecard Review)', () => {
  let scorecardPage: AiScorecardPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Bỏ qua product tour
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_interview_detail', 'true');
      } catch {}
    });

    scorecardPage = new AiScorecardPage(page);
  });

  /**
   * EMP-08: Xem chi tiết bảng điểm AI Scorecard, điểm kỹ thuật/giao tiếp và Radar chart
   */
  test('EMP-08: View AI Scorecard overall score, category breakdown and competency radar', async ({ page }) => {
    await scorecardPage.goto(MOCK_INTERVIEW_DETAIL_COMPLETED.id);

    // 1. Kiểm tra điểm tổng thể (Overall Score)
    const overallScore = await scorecardPage.getOverallScore();
    expect(overallScore).toBeGreaterThanOrEqual(0);

    // 2. Kiểm tra điểm kỹ thuật và giao tiếp
    await expect(scorecardPage.technicalScoreElement).toBeVisible({ timeout: 15_000 });
    await expect(scorecardPage.communicationScoreElement).toBeVisible({ timeout: 15_000 });

    // 3. Biểu đồ Radar năng lực hiển thị
    await expect(scorecardPage.radarChartContainer).toBeVisible({ timeout: 15_000 });
  });

  /**
   * EMP-08: Mở tab Bản ghi hình / ghi âm và kiểm tra media player
   */
  test('EMP-08: Play audio/video recording from the interview session', async () => {
    await scorecardPage.goto(MOCK_INTERVIEW_DETAIL_COMPLETED.id);

    // Chuyển sang tab Bản ghi hình
    await scorecardPage.playAudioRecording();
  });

  /**
   * EMP-08: Mở tab Bản ghi hội thoại (Transcript) và đọc nội dung câu hỏi/câu trả lời
   */
  test('EMP-08: Inspect transcript dialogue bubbles and questions', async () => {
    await scorecardPage.goto(MOCK_INTERVIEW_DETAIL_COMPLETED.id);

    // Chuyển sang tab Bản ghi hội thoại
    const transcriptText = await scorecardPage.getTranscriptText();
    expect(transcriptText.length).toBeGreaterThan(0);
  });

  /**
   * EMP-08: Kiểm tra biên bản giám sát tính toàn vẹn (AI Proctoring Audit)
   */
  test('EMP-08: Review AI proctoring integrity audit for candidate tab switch warnings', async () => {
    await scorecardPage.goto(MOCK_INTERVIEW_DETAIL_COMPLETED.id);

    // Kiểm tra thông tin giám sát thi
    await scorecardPage.expectProctoringAuditVisible();
  });
});
