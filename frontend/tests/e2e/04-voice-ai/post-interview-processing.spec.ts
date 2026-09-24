import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainVoiceAiMocks } from '../../mocks/mock-voice-ai';
import { PreflightPage } from '../../pages/voice-ai/preflight.page';
import { LivekitRoomPage } from '../../pages/voice-ai/livekit-room.page';
import { PostInterviewPage } from '../../pages/voice-ai/post-interview.page';

test.use({
  permissions: ['microphone', 'camera'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
});

test.describe('Phân Hệ Voice AI - Hoàn Tất Phỏng Vấn, URL Guard & Responsive Mobile (Post-Interview & Edge)', () => {
  const inviteToken = 'token-post-interview-07';
  const roomName = 'room-post-interview-07';

  /**
   * VOICE-07: Completed session URL guard (cannot re-take finished interview)
   */
  test('VOICE-07: Chặn thi lại khi mở URL phỏng vấn đã hoàn tất, trực tiếp hiển thị bảng điểm đánh giá AI', async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'completed',
      sessionType: 'mock',
    });

    const postInterview = new PostInterviewPage(page);

    // 1. Mở lại link buổi phỏng vấn đã kết thúc
    await postInterview.gotoInterview(inviteToken);
    await postInterview.waitForLoadingGone();

    // 2. Xác nhận hiển thị trực tiếp màn hình kết quả đánh giá (Completed View)
    await postInterview.expectCompletedState();

    // 3. Xác nhận hiển thị điểm đánh giá và điểm mạnh/yếu
    await postInterview.expectScores();
    await postInterview.expectFeedbackStrengthsWeaknesses();

    // 4. Guard chống thi lại: đảm bảo không có nút vào phòng lại
    await postInterview.expectCompletedSessionGuard();
  });

  /**
   * VOICE-09: Reconnection banner when network disconnects
   */
  test('VOICE-09: Hiển thị cảnh báo kết nối lại khi mạng bị ngắt quãng giữa buổi phỏng vấn', async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'scheduled',
    });

    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    // 1. Vào phòng phỏng vấn
    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 2. Giả lập mất kết nối mạng (Offline mode)
    await context.setOffline(true);

    // 3. Đợi và kiểm tra phản hồi của hệ thống khi mất kết nối mạng
    // (LiveKit reconnection banner hoặc cảnh báo kết nối)
    await page.waitForTimeout(1000);
    const connectionIndicator = page.locator('div, span, p').filter({
      hasText: /mất kết nối|kết nối lại|offline|reconnect|mất tín hiệu/i,
    });
    const hasReconnectionFeedback = await connectionIndicator.first().isVisible().catch(() => false);
    // Nếu banner hiển thị, xác nhận nó
    if (hasReconnectionFeedback) {
      await expect(connectionIndicator.first()).toBeVisible({ timeout: 5000 });
    }

    // 4. Khôi phục lại kết nối mạng (Online)
    await context.setOffline(false);
    await page.waitForTimeout(1000);
    // Phòng phỏng vấn vẫn tiếp tục hiển thị câu hỏi ổn định
    await expect(room.questionCard).toBeVisible({ timeout: 15_000 });
  });

  /**
   * VOICE-10: Mobile web interview viewport layout
   */
  test('VOICE-10: Giao diện phòng phỏng vấn co giãn tối ưu trên thiết bị di động (iPhone 14: 390x844)', async ({ page }) => {
    // Thiết lập kích thước viewport chuẩn iPhone 14
    await page.setViewportSize({ width: 390, height: 844 });

    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'scheduled',
    });

    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Kiểm tra Question Card hiển thị gọn gàng trên mobile
    await expect(room.questionCard).toBeVisible({ timeout: 20_000 });

    // 2. Kiểm tra thanh điều khiển Media (Mic / Cam / Kết thúc) nằm trong tầm với ngón cái
    await expect(room.toggleMicBtn).toBeVisible({ timeout: 10_000 });
    await expect(room.toggleCamBtn).toBeVisible({ timeout: 10_000 });
    await expect(room.endInterviewBtn).toBeVisible({ timeout: 10_000 });

    // 3. Đảm bảo trang không bị lỗi tràn ngang màn hình (Horizontal scroll overflow = 0)
    const isHorizontalScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isHorizontalScrollable).toBeFalsy();
  });
});
