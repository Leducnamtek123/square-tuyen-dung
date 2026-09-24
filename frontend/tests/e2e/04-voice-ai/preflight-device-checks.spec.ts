import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainVoiceAiMocks } from '../../mocks/mock-voice-ai';
import { PreflightPage } from '../../pages/voice-ai/preflight.page';

test.use({
  permissions: ['microphone', 'camera'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
});

test.describe('Phân Hệ Voice AI - Kiểm Tra Thiết Bị Tiền Phỏng Vấn (Preflight Device Checks)', () => {
  const inviteToken = 'token-preflight-check-01';
  const roomName = 'room-preflight-check-01';

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainVoiceAiMocks(page, {
      inviteToken,
      roomName,
      status: 'scheduled',
    });
  });

  /**
   * VOICE-01: Preflight device check with fake mic/camera, audio meter active
   */
  test('VOICE-01: Xác thực tiền kiểm tra thiết bị với fake mic/camera và audio meter dao động', async ({ page }) => {
    const preflight = new PreflightPage(page);

    // 1. Mở trang phỏng vấn với inviteToken hợp lệ
    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();

    // 2. Kiểm tra thông tin ứng viên và chức danh tuyển dụng trên màn chờ
    await preflight.expectCandidateInfo('Nguyen Van Ung Vien', 'Senior Fullstack Engineer');

    // 3. Khởi động bước tiền kiểm tra nếu xuất hiện nút Bắt đầu
    await preflight.startPreflightIfPresent();

    // 4. Chờ giao diện Preflight Room sẵn sàng
    await preflight.waitForPreflightReady();

    // 5. Kiểm tra thanh Audio Level Meter / Equalizer dao động có tín hiệu âm thanh
    const isMeterActive = await preflight.isAudioMeterActive();
    expect(isMeterActive).toBeTruthy();

    // 6. Kiểm tra khung video webcam hoạt động
    await expect(preflight.videoElement.first()).toBeVisible({ timeout: 15_000 });

    // 7. Nút vào phòng phỏng vấn hoặc nút bỏ qua sẵn sàng hoạt động
    const isReadyToJoin =
      (await preflight.joinRoomBtn.isVisible().catch(() => false)) ||
      (await preflight.skipCheckAndJoinBtn.isVisible().catch(() => false));
    expect(isReadyToJoin).toBeTruthy();
  });

  /**
   * VOICE-08: Permission denied error handling
   */
  test('VOICE-08: Xử lý cảnh báo và hướng dẫn mở quyền khi trình duyệt từ chối quyền Mic/Cam', async ({ page }) => {
    // Giả lập từ chối cấp quyền getUserMedia (NotAllowedError / PermissionDeniedError)
    await page.addInitScript(() => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = async () => {
          throw new DOMException('Permission was denied by system', 'NotAllowedError');
        };
      }
    });

    const preflight = new PreflightPage(page);
    await preflight.gotoInterview(inviteToken);
    await preflight.waitForLoadingGone();

    // Mở màn Preflight
    await preflight.startPreflightIfPresent();

    // Xác nhận hiển thị thông báo hướng dẫn mở quyền trên trình duyệt
    await preflight.expectPermissionDeniedGuide();

    // Xác nhận nút fallback "Bỏ qua kiểm tra & Vào phòng" hiển thị cho ứng viên
    await expect(preflight.skipCheckAndJoinBtn.first()).toBeVisible({ timeout: 10_000 });
  });
});
