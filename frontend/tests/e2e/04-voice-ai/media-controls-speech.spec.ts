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

test.describe('Phân Hệ Voice AI - Điều Khiển Media & Sóng Âm Thoại (Media Controls & Speech Waveform)', () => {
  const inviteToken = 'token-media-controls-05';
  const roomName = 'room-media-controls-05';

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'scheduled',
    });
  });

  /**
   * VOICE-05: Media controls (Mute/Unmute mic, toggle camera)
   */
  test('VOICE-05: Bật/Tắt Micro và Camera phản hồi icon và trạng thái chính xác', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Kiểm tra bật/tắt Micro
    await expect(room.toggleMicBtn).toBeVisible({ timeout: 15_000 });
    // Bấm tắt mic (Mute)
    await room.toggleMute();
    // Đợi cập nhật trạng thái
    await page.waitForTimeout(500);
    const isMuted = await room.isMicrophoneMuted();
    expect(isMuted).toBeTruthy();

    // Bấm bật lại mic (Unmute)
    await room.toggleMute();
    await page.waitForTimeout(500);
    const isUnmuted = await room.isMicrophoneMuted();
    expect(isUnmuted).toBeFalsy();

    // 2. Kiểm tra bật/tắt Camera
    await expect(room.toggleCamBtn).toBeVisible({ timeout: 15_000 });
    // Bấm tắt camera
    await room.toggleCamera();
    await page.waitForTimeout(500);
    const isCamOff = await room.isCameraOff();
    expect(isCamOff).toBeTruthy();

    // Bấm bật lại camera
    await room.toggleCamera();
    await page.waitForTimeout(500);
    const isCamBackOn = await room.isCameraOff();
    expect(isCamBackOn).toBeFalsy();
  });

  /**
   * VOICE-06: Speaking waveform pulse indicator (AI & candidate)
   */
  test('VOICE-06: Hiệu ứng sóng âm phát biểu nhịp nhàng cho trợ lý AI và ứng viên', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Kiểm tra vạch sóng âm / chỉ báo phát biểu của Trợ lý AI AILA
    await room.expectSpeakingWaveformActive('ai');

    // 2. Kiểm tra chỉ báo âm thanh / sóng micro của ứng viên
    await room.expectSpeakingWaveformActive('candidate');
  });
});
