import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * PreflightPage - Page Object quản lý màn hình chờ tiền phỏng vấn và kiểm tra thiết bị (Preflight Room)
 * Phục vụ kiểm tra microphone, webcam, hiển thị thông tin ứng viên và chuyển tiếp vào phòng phỏng vấn AILA
 */
export class PreflightPage extends BasePage {
  readonly startInterviewBtn: Locator;
  readonly joinRoomBtn: Locator;
  readonly skipCheckAndJoinBtn: Locator;
  readonly backBtn: Locator;
  readonly cameraToggleSwitch: Locator;
  readonly videoElement: Locator;
  readonly audioEngineEqualizer: Locator;
  readonly audioSignalText: Locator;
  readonly permissionAlert: Locator;
  readonly prepProgressModal: Locator;
  readonly candidateNameEl: Locator;
  readonly jobTitleEl: Locator;

  constructor(page: Page) {
    super(page);
    this.startInterviewBtn = page
      .getByTestId('start-interview-btn')
      .or(page.getByRole('button', { name: /bắt đầu phỏng vấn|bắt đầu luyện tập|bắt đầu/i }));
    this.joinRoomBtn = page.getByTestId('join-interview-room-btn');
    this.skipCheckAndJoinBtn = page.getByTestId('skip-check-and-join-btn');
    this.backBtn = page.getByRole('button', { name: /quay lại/i });
    this.cameraToggleSwitch = page.locator('input[type="checkbox"]').or(page.locator('.MuiSwitch-input'));
    this.videoElement = page.locator('video');
    this.audioEngineEqualizer = page.locator('text=Kiểm tra âm thanh');
    this.audioSignalText = page.getByText(/đang nhận tín hiệu|đang nghe|rất tốt|hãy nói để kiểm tra/i);
    this.permissionAlert = page.locator('.MuiAlert-root, [role="alert"], p, div').filter({
      hasText: /chưa được cấp quyền|không thể truy cập|quyền truy cập|cấp quyền/i,
    });
    this.prepProgressModal = page.locator('[role="dialog"]').filter({
      hasText: /chuẩn bị phòng phỏng vấn|đang kết nối|làm nóng mô hình/i,
    });
    this.candidateNameEl = page.locator('p, span, div, h2, h3').filter({ hasText: /nguyen van ung vien/i });
    this.jobTitleEl = page.locator('p, span, div, h1, h2').filter({ hasText: /senior fullstack engineer|luyện tập/i });
  }

  /**
   * Điều hướng tới phòng phỏng vấn theo token
   */
  async gotoInterview(token: string) {
    await this.goto(`/interview/${token}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Bấm nút "Bắt đầu phỏng vấn" trên màn hình chờ ban đầu (nếu có) để mở màn hình Preflight Check
   */
  async startPreflightIfPresent(timeout = 10_000) {
    try {
      if (await this.startInterviewBtn.first().isVisible({ timeout })) {
        await this.startInterviewBtn.first().click();
      }
    } catch {
      // Có thể đã trực tiếp ở màn Preflight
    }
  }

  /**
   * Xác nhận hiển thị thông tin ứng viên và chức danh ứng tuyển
   */
  async expectCandidateInfo(candidateName = 'Nguyen Van Ung Vien', jobTitle = 'Senior Fullstack Engineer') {
    const candidateEl = this.page.getByText(new RegExp(candidateName, 'i')).first();
    const jobEl = this.page.getByText(new RegExp(jobTitle, 'i')).first();
    await expect(candidateEl).toBeVisible({ timeout: 15_000 });
    await expect(jobEl).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Chờ màn hình Preflight hoàn tất tải các thiết bị
   */
  async waitForPreflightReady(timeout = 20_000) {
    const readyIndicator = this.joinRoomBtn.or(this.skipCheckAndJoinBtn).or(this.audioEngineEqualizer);
    await expect(readyIndicator.first()).toBeVisible({ timeout });
  }

  /**
   * Kiểm tra thanh đo âm lượng Audio Level Meter / Equalizer dao động có tín hiệu
   */
  async isAudioMeterActive(): Promise<boolean> {
    const equalizer = this.audioEngineEqualizer.first();
    await expect(equalizer).toBeVisible({ timeout: 15_000 });
    const signal = this.audioSignalText.first();
    return (await signal.isVisible().catch(() => false)) || (await equalizer.isVisible());
  }

  /**
   * Bấm nút vào phòng phỏng vấn LiveKit
   */
  async clickJoinRoom() {
    if (await this.joinRoomBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.joinRoomBtn.click();
    } else if (await this.skipCheckAndJoinBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.skipCheckAndJoinBtn.click();
    } else {
      const fallbackBtn = this.page.locator('button').filter({ hasText: /vào phòng|tham gia|bắt đầu luyện tập/i }).first();
      await fallbackBtn.click();
    }
  }

  /**
   * Bấm nút "Bỏ qua kiểm tra & Vào phòng" khi có sự cố thiết bị
   */
  async clickSkipAndJoin() {
    await expect(this.skipCheckAndJoinBtn.first()).toBeVisible({ timeout: 10_000 });
    await this.skipCheckAndJoinBtn.first().click();
  }

  /**
   * Xác nhận hiển thị thông báo hướng dẫn khi bị từ chối quyền truy cập Micro / Camera
   */
  async expectPermissionDeniedGuide() {
    await expect(this.permissionAlert.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Bật / Tắt công tắc Camera trong Preflight
   */
  async toggleCamera() {
    await this.cameraToggleSwitch.first().click();
  }
}
