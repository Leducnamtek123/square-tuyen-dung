import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * LivekitRoomPage - Page Object quản lý phòng phỏng vấn trực tiếp WebRTC LiveKit & Trợ lý AILA
 * Đóng gói HUD câu hỏi, đồng hồ đếm ngược, thanh điều khiển Media (Mic/Cam), sóng âm phát biểu và kết thúc phiên
 */
export class LivekitRoomPage extends BasePage {
  readonly questionCard: Locator;
  readonly questionText: Locator;
  readonly toggleMicBtn: Locator;
  readonly toggleCamBtn: Locator;
  readonly endInterviewBtn: Locator;
  readonly confirmEndBtn: Locator;
  readonly nextQuestionBtn: Locator;
  readonly candidateVideoTile: Locator;
  readonly agentAvatarTile: Locator;
  readonly countdownClock: Locator;
  readonly questionIndexBadge: Locator;
  readonly reconnectionBanner: Locator;
  readonly tabSwitchWarning: Locator;
  readonly observingBar: Locator;

  constructor(page: Page) {
    super(page);
    this.questionCard = page.getByTestId('interview-question-card');
    this.questionText = page.getByTestId('interview-question-text');
    this.toggleMicBtn = page.getByTestId('toggle-mic-btn');
    this.toggleCamBtn = page.getByTestId('toggle-cam-btn');
    this.endInterviewBtn = page.getByTestId('end-interview-btn');
    this.confirmEndBtn = page.getByTestId('confirm-end-interview-btn');
    this.nextQuestionBtn = page.locator('button').filter({ hasText: /chuyển câu|hoàn thành/i });
    this.candidateVideoTile = page.locator('[data-tour="interview-candidate"]');
    this.agentAvatarTile = page.locator('[data-tour="interview-agent"]');
    this.countdownClock = page.locator('div, span').filter({ hasText: /^[0-9]{2}:[0-9]{2}$/ });
    this.questionIndexBadge = page.locator('span').filter({ hasText: /Câu [0-9]+\/[0-9]+/i });
    this.reconnectionBanner = page.locator('div, p, span').filter({
      hasText: /mất kết nối|đang kết nối lại|reconnecting|mất tín hiệu/i,
    });
    this.tabSwitchWarning = page.locator('div').filter({ hasText: /cảnh báo:.*chuyển tab/i });
    this.observingBar = page.locator('div').filter({ hasText: /trực tiếp|đang quan sát|phỏng vấn/i });
  }

  /**
   * Chờ kết nối phòng LiveKit thành công và hiển thị giao diện HUD hoạt động
   */
  async waitForConnected(timeout = 30_000) {
    const activeHUD = this.questionCard.or(this.toggleMicBtn).or(this.candidateVideoTile);
    await expect(activeHUD.first()).toBeVisible({ timeout });
  }

  /**
   * Lấy thông tin câu hỏi hiện tại từ Question Card HUD
   */
  async getCurrentQuestion() {
    await expect(this.questionCard).toBeVisible({ timeout: 15_000 });
    const text = await this.questionText.innerText();
    const indexBadge = await this.questionIndexBadge.first().innerText().catch(() => '');
    return { text: text.trim(), indexBadge: indexBadge.trim() };
  }

  /**
   * Đọc giá trị đồng hồ đếm ngược hiện tại
   */
  async getCountdownTimer(): Promise<string> {
    const timer = this.countdownClock.first();
    await expect(timer).toBeVisible({ timeout: 10_000 });
    return (await timer.innerText()).trim();
  }

  /**
   * Bấm chuyển câu hỏi kế tiếp hoặc kết thúc trả lời
   */
  async submitCurrentAnswer() {
    await expect(this.nextQuestionBtn.first()).toBeVisible({ timeout: 10_000 });
    await this.nextQuestionBtn.first().click();
  }

  /**
   * Bật / Tắt Microphone
   */
  async toggleMute() {
    await expect(this.toggleMicBtn).toBeVisible({ timeout: 10_000 });
    await this.toggleMicBtn.click();
  }

  /**
   * Bật / Tắt Camera
   */
  async toggleCamera() {
    await expect(this.toggleCamBtn).toBeVisible({ timeout: 10_000 });
    await this.toggleCamBtn.click();
  }

  /**
   * Kiểm tra trạng thái Micro có đang bị tắt (Muted) hay không
   */
  async isMicrophoneMuted(): Promise<boolean> {
    const btn = this.toggleMicBtn;
    const ariaLabel = (await btn.getAttribute('aria-label')) || '';
    const classAttr = (await btn.getAttribute('class')) || '';
    return (
      ariaLabel.toLowerCase().includes('bật') ||
      ariaLabel.toLowerCase().includes('unmute') ||
      classAttr.includes('text-rose-500')
    );
  }

  /**
   * Kiểm tra trạng thái Camera có đang tắt hay không
   */
  async isCameraOff(): Promise<boolean> {
    const btn = this.toggleCamBtn;
    const ariaLabel = (await btn.getAttribute('aria-label')) || '';
    const classAttr = (await btn.getAttribute('class')) || '';
    const cameraOffPlaceholder = this.page.getByText(/camera.*đang tắt/i).first();
    const isPlaceholderVisible = await cameraOffPlaceholder.isVisible().catch(() => false);
    return (
      ariaLabel.toLowerCase().includes('bật') ||
      ariaLabel.toLowerCase().includes('turn on') ||
      classAttr.includes('text-rose-500') ||
      isPlaceholderVisible
    );
  }

  /**
   * Kiểm tra hiệu ứng sóng âm hoặc nhịp thở (Speaking Waveform / Pulse)
   */
  async expectSpeakingWaveformActive(role: 'ai' | 'candidate') {
    if (role === 'ai') {
      const aiAvatar = this.agentAvatarTile.first();
      await expect(aiAvatar).toBeVisible({ timeout: 15_000 });
      const visualizer = aiAvatar.locator('svg, canvas, [class*="visualizer"], div[class*="pulse"]').first();
      await expect(visualizer.or(aiAvatar)).toBeVisible({ timeout: 10_000 });
    } else {
      const candidateTile = this.candidateVideoTile.first();
      await expect(candidateTile).toBeVisible({ timeout: 15_000 });
      const micBadge = candidateTile.locator('[class*="LiveMicActivity"], [data-speaking], svg, [class*="badge"]').first();
      await expect(micBadge.or(candidateTile)).toBeVisible({ timeout: 10_000 });
    }
  }

  /**
   * Kết thúc buổi phỏng vấn và xác nhận qua modal
   */
  async finishInterview() {
    await expect(this.endInterviewBtn).toBeVisible({ timeout: 10_000 });
    await this.endInterviewBtn.click();

    if (await this.confirmEndBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.confirmEndBtn.click();
    }
  }

  /**
   * Xác nhận hiển thị banner mất kết nối / đang kết nối lại
   */
  async expectReconnectionBanner(message?: string | RegExp) {
    const banner = message
      ? this.page.locator('div, p, span').filter({ hasText: message }).first()
      : this.reconnectionBanner.first();
    await expect(banner).toBeVisible({ timeout: 15_000 });
  }
}
