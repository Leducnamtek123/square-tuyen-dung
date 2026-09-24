import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainVoiceAiMocks } from '../../mocks/mock-voice-ai';
import { PreflightPage } from '../../pages/voice-ai/preflight.page';
import { LivekitRoomPage } from '../../pages/voice-ai/livekit-room.page';

test.use({
  permissions: ['microphone', 'camera'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
});

test.describe('Phân Hệ Voice AI - Tương Tác HUD Câu Hỏi & Điều Hướng (In-Call HUD Interactions)', () => {
  const inviteToken = 'token-hud-interactions-03';
  const roomName = 'room-hud-interactions-03';

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'scheduled',
    });
  });

  /**
   * VOICE-03: HUD Question card countdown timer and question 1 display
   */
  test('VOICE-03: Thẻ Question Card HUD hiển thị chính xác câu hỏi 1, nội dung và đồng hồ đếm ngược', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Kiểm tra Question Card HUD hiển thị
    await expect(room.questionCard).toBeVisible({ timeout: 20_000 });

    // 2. Kiểm tra thông tin câu hỏi 1
    const { text, indexBadge } = await room.getCurrentQuestion();
    expect(indexBadge).toMatch(/câu 1/i);
    expect(text).toContain('Bạn hãy giới thiệu về bản thân');

    // 3. Kiểm tra đồng hồ đếm ngược đang hiển thị định dạng mm:ss
    const timerValue = await room.getCountdownTimer();
    expect(timerValue).toMatch(/^[0-9]{2}:[0-9]{2}$/);
  });

  /**
   * VOICE-04: Next question transitions and completion
   */
  test('VOICE-04: Chuyển câu hỏi kế tiếp, cập nhật nội dung câu hỏi mới và chuyển nút hoàn thành ở câu cuối', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Đang ở câu 1, bấm "Chuyển câu"
    await room.submitCurrentAnswer();

    // 2. Xác nhận HUD chuyển sang câu 2 / 2
    await expect(room.questionIndexBadge.first()).toHaveText(/câu 2/i, { timeout: 15_000 });
    const { text } = await room.getCurrentQuestion();
    expect(text).toContain('hiệu năng cao');

    // 3. Ở câu hỏi cuối cùng, nút chuyển câu cập nhật nhãn thành "Hoàn thành"
    await expect(room.nextQuestionBtn.first()).toHaveText(/hoàn thành/i, { timeout: 10_000 });
  });
});
