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

test.describe('Phân Hệ Voice AI - Kết Nối Phòng Phỏng Vấn LiveKit (LiveKit Room Connection)', () => {
  const validToken = 'token-livekit-conn-02';
  const roomName = 'room-livekit-conn-02';

  /**
   * VOICE-02: Connect to LiveKit room, room state = connected
   */
  test('VOICE-02: Kết nối thành công vào phòng LiveKit, chuyển trạng thái connected và hiển thị HUD', async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken: validToken,
      roomName,
      status: 'scheduled',
    });

    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    // 1. Mở trang phỏng vấn với token hợp lệ
    await preflight.gotoInterview(validToken);
    await preflight.waitForLoadingGone();

    // 2. Bắt đầu preflight và bấm nút tham gia phòng
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();

    // 3. Xác nhận kết nối phòng WebRTC thành công và giao diện active room xuất hiện
    await room.waitForConnected();

    // 4. Kiểm tra Question Card HUD và Avatar trợ lý AI AILA hiển thị trung tâm
    await expect(room.questionCard).toBeVisible({ timeout: 20_000 });
    await expect(room.agentAvatarTile.first()).toBeVisible({ timeout: 20_000 });
    await expect(room.candidateVideoTile.first()).toBeVisible({ timeout: 20_000 });
  });

  test('VOICE-02-Negative: Báo lỗi và chặn vào phòng khi sử dụng inviteToken không hợp lệ hoặc đã hết hạn', async ({ page }) => {
    const invalidToken = 'invalid-expired-token-999';

    // Mock trả về 404 cho token không hợp lệ
    await page.route(`**/api/**/interview/web/sessions/**`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Token phỏng vấn không hợp lệ hoặc đã hết hạn.',
          errors: {
            detail: ['Token phỏng vấn không hợp lệ hoặc đã hết hạn.'],
          },
        }),
      });
    });

    const preflight = new PreflightPage(page);
    await preflight.gotoInterview(invalidToken);

    // Xác nhận hiển thị thông báo lỗi phiên phỏng vấn
    const errorAlert = page.locator('[role="alert"], .MuiAlert-message, h2, p').filter({
      hasText: /không hợp lệ|hết hạn|không tìm thấy|invalid/i,
    });
    await expect(errorAlert.first()).toBeVisible({ timeout: 20_000 });

    // Đảm bảo không render giao diện phòng phỏng vấn
    const room = new LivekitRoomPage(page);
    await expect(room.questionCard).toHaveCount(0);
  });
});
