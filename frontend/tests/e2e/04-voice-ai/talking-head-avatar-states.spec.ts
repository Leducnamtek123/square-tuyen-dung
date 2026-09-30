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

test.describe('Phân Hệ Voice AI - Talking Head Avatar & State Machine Transitions', () => {
  const inviteToken = 'token-avatar-talkinghead-01';
  const roomName = 'room-avatar-talkinghead-01';

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'scheduled',
      interviewerName: 'Trợ lý AI AILA',
    });
  });

  /**
   * VOICE-AVATAR-01: Avatar hiển thị video chào hỏi (wave) và chuyển sang trạng thái sẵn sàng phỏng vấn / lắng nghe
   */
  test('VOICE-AVATAR-01: Avatar hiển thị video trạng thái và State Badge sẵn sàng / lắng nghe', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Kiểm tra Avatar tile của Trợ lý AI hiện diện
    await expect(room.agentAvatarTile.first()).toBeVisible({ timeout: 20_000 });

    // 2. Kiểm tra State Badge hiển thị trạng thái tiếng Việt
    await room.expectAvatarState(/sẵn sàng|lắng nghe|chào|phân tích|phát biểu/i);

    // 3. Kiểm tra thẻ video stageIdle hoạt động
    await expect(room.idleVideoElement.first()).toBeVisible({ timeout: 15_000 });

    // 4. Kiểm tra viên Voice Visualizer Pill ở góc dưới
    await expect(room.avatarVisualizerPill.first()).toBeVisible({ timeout: 10_000 });
  });

  /**
   * VOICE-AVATAR-02: Chuyển đổi câu hỏi trên Question Card HUD duy trì tính ổn định của Avatar
   */
  test('VOICE-AVATAR-02: Chuyển đổi câu hỏi duy trì Avatar Tile và HUD hoạt động mượt mà', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // 1. Kiểm tra câu 1 hiển thị
    await expect(room.questionCard).toBeVisible({ timeout: 20_000 });
    const { indexBadge: badge1 } = await room.getCurrentQuestion();
    expect(badge1).toMatch(/câu 1/i);

    // 2. Bấm chuyển câu hỏi
    await room.submitCurrentAnswer();

    // 3. Xác nhận chuyển sang câu 2 và Avatar Tile không bị unmount/crash
    await expect(room.questionIndexBadge.first()).toHaveText(/câu 2/i, { timeout: 15_000 });
    await expect(room.agentAvatarTile.first()).toBeVisible({ timeout: 10_000 });
    await room.expectAvatarState(/sẵn sàng|lắng nghe|phân tích|phát biểu/i);
  });

  /**
   * VOICE-AVATAR-03: Nhà tuyển dụng sử dụng Avatar ảnh tĩnh tùy chỉnh (Custom Image Fallback)
   */
  test('VOICE-AVATAR-03: Render ảnh tĩnh tùy chỉnh khi nhà tuyển dụng cấu hình avatar riêng', async ({ page }) => {
    const customToken = 'token-avatar-talkinghead-03';
    const customRoom = 'room-avatar-talkinghead-03';
    const customAvatarUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400';
    await page.route('**/*photo-1573496359142-b8d87734a5a2*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#3b82f6"/></svg>',
      });
    });

    await setupDomainVoiceAiMocks(page, {
      inviteToken: customToken,
      roomName: customRoom,
      status: 'scheduled',
      avatarId: 'custom',
      avatarImageUrl: customAvatarUrl,
    });

    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(customToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // Xác nhận render thẻ img với đường dẫn tùy chỉnh thay vì video mặc định
    await expect(room.customAvatarImage.first()).toBeVisible({ timeout: 15_000 });
  });

  /**
   * VOICE-AVATAR-04: Kết thúc phỏng vấn an toàn và kích hoạt trạng thái hoàn tất
   */
  test('VOICE-AVATAR-04: Kết thúc phỏng vấn chuyển sang màn hình hoàn tất thành công', async ({ page }) => {
    const preflight = new PreflightPage(page);
    const room = new LivekitRoomPage(page);

    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();
    await preflight.startPreflightIfPresent();
    await preflight.waitForPreflightReady();
    await preflight.clickJoinRoom();
    await room.waitForConnected();

    // Bấm kết thúc buổi phỏng vấn
    await room.finishInterview();

    // Xác nhận điều hướng hoặc hiển thị thông báo hoàn thành
    const finishConfirmation = page.locator('div, h2, h3, p').filter({
      hasText: /hoàn tất|kết thúc|thành công|đang phân tích|kết quả/i,
    });
    await expect(finishConfirmation.first()).toBeVisible({ timeout: 25_000 });
  });
});
