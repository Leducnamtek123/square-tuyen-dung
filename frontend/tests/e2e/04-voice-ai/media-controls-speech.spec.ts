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
    const initiallyMuted = await room.isMicrophoneMuted();

    // Bấm đổi trạng thái Micro lần 1
    await room.toggleMute();
    await page.waitForTimeout(500);
    const micAfterFirstToggle = await room.isMicrophoneMuted();
    expect(micAfterFirstToggle).toBe(!initiallyMuted);

    // Bấm đổi trạng thái Micro lần 2 để hoàn nguyên
    await room.toggleMute();
    await page.waitForTimeout(500);
    const micAfterSecondToggle = await room.isMicrophoneMuted();
    expect(micAfterSecondToggle).toBe(initiallyMuted);

    // 2. Kiểm tra bật/tắt Camera
    await expect(room.toggleCamBtn).toBeVisible({ timeout: 15_000 });
    const initiallyCamOff = await room.isCameraOff();

    // Bấm đổi trạng thái Camera lần 1
    await room.toggleCamera();
    await page.waitForTimeout(500);
    const camAfterFirstToggle = await room.isCameraOff();
    expect(camAfterFirstToggle).toBe(!initiallyCamOff);

    // Bấm đổi trạng thái Camera lần 2 để hoàn nguyên
    await room.toggleCamera();
    await page.waitForTimeout(500);
    const camAfterSecondToggle = await room.isCameraOff();
    expect(camAfterSecondToggle).toBe(initiallyCamOff);
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
