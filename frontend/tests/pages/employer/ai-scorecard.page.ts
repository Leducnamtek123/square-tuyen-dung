import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * AiScorecardPage - Page Object Model xem chi tiết kết quả phỏng vấn AI và bảng điểm AI Scorecard
 * Phục vụ kiểm thử EMP-08: Overall score, Radar chart, Audio/Video player, Transcript STT, Proctoring audit
 */
export class AiScorecardPage extends BasePage {
  // Scorecard Overview Header & Badges
  readonly overallScoreElement: Locator;
  readonly technicalScoreElement: Locator;
  readonly communicationScoreElement: Locator;
  readonly radarChartContainer: Locator;

  // Tabs Navigation
  readonly tabsList: Locator;
  readonly analysisTab: Locator;
  readonly transcriptTab: Locator;
  readonly recordingTab: Locator;
  readonly questionsTab: Locator;

  // Recording Player
  readonly mediaVideoPlayer: Locator;
  readonly openRecordingBtn: Locator;

  // Transcript Panel
  readonly transcriptContainer: Locator;
  readonly transcriptBubbles: Locator;

  // Proctoring & Integrity Audit
  readonly proctoringAuditSection: Locator;
  readonly proctoringViolationBadge: Locator;

  constructor(page: Page) {
    super(page);

    this.overallScoreElement = page.locator('[data-tour="interview-detail-score"], [class*="InterviewAiEvaluationCard"]').first();
    this.technicalScoreElement = page.locator('text=/kỹ thuật|chuyên môn/i').first();
    this.communicationScoreElement = page.locator('text=/giao tiếp|thuyết trình/i').first();
    this.radarChartContainer = page.locator('canvas, [class*="CompetencyRadarChart"], svg').first();

    this.tabsList = page.locator('.MuiTabs-root').first();
    this.analysisTab = page.getByRole('tab', { name: /phân tích ai/i }).first();
    this.transcriptTab = page.getByRole('tab', { name: /bản ghi hội thoại/i }).first();
    this.recordingTab = page.getByRole('tab', { name: /bản ghi hình|ghi âm/i }).first();
    this.questionsTab = page.getByRole('tab', { name: /bộ câu hỏi/i }).first();

    this.mediaVideoPlayer = page.locator('video, audio').first();
    this.openRecordingBtn = page.getByRole('button', { name: /mở bản ghi hình|mở bản ghi âm/i }).or(
      page.getByRole('link', { name: /mở bản ghi/i })
    ).first();

    this.transcriptContainer = page.locator('[class*="InterviewTranscriptPanel"]').first();
    this.transcriptBubbles = page.locator('[class*="InterviewTranscriptPanel"] .MuiPaper-root, [class*="InterviewTranscriptPanel"] [class*="MuiBox-root"]');

    this.proctoringAuditSection = page.locator('text=/biên bản giám sát|ai proctoring audit/i').first();
    this.proctoringViolationBadge = page.locator('text=/cảnh báo|lần rời màn hình|vi phạm/i').first();
  }

  /**
   * Điều hướng tới trang chi tiết buổi phỏng vấn AI
   */
  async goto(sessionId: number | string = 777) {
    await super.goto(`/employer/interviews/${sessionId}`);
    await this.waitForLoadingGone();
  }

  /**
   * Đọc điểm tổng thể (Overall Score)
   */
  async getOverallScore(): Promise<number> {
    await expect(this.overallScoreElement).toBeVisible({ timeout: 15_000 });
    const text = (await this.overallScoreElement.textContent()) || '';
    const match = text.match(/(\d+(\.\d+)?)\s*(\/10|\/100|điểm)?/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Chuyển tab trong không gian làm việc chi tiết
   */
  async selectTab(tab: 'analysis' | 'transcript' | 'recording' | 'questions') {
    const tabMap: Record<string, Locator> = {
      analysis: this.analysisTab,
      transcript: this.transcriptTab,
      recording: this.recordingTab,
      questions: this.questionsTab,
    };
    const target = tabMap[tab];
    await expect(target).toBeVisible({ timeout: 10_000 });
    await target.click();
    await this.waitForLoadingGone();
  }

  /**
   * Xác thực và phát media ghi âm / ghi hình phỏng vấn
   */
  async playAudioRecording() {
    await this.selectTab('recording');
    await expect(this.mediaVideoPlayer.or(this.openRecordingBtn)).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Lấy nội dung bản ghi chép Transcript
   */
  async getTranscriptText(): Promise<string> {
    await this.selectTab('transcript');
    await expect(this.transcriptContainer).toBeVisible({ timeout: 15_000 });
    return (await this.transcriptContainer.textContent()) || '';
  }

  /**
   * Kiểm tra thông tin giám sát Proctoring (số lần chuyển tab / cảnh báo)
   */
  async expectProctoringAuditVisible() {
    await this.selectTab('analysis');
    await expect(this.proctoringAuditSection).toBeVisible({ timeout: 15_000 });
  }
}
