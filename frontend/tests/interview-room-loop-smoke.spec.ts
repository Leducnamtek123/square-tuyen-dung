import { test, expect } from '@playwright/test';

test.use({
  permissions: ['microphone', 'camera'],
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
    ],
  },
});

test.describe('Candidate interview room smoke', () => {
  test('does not lock the browser or spin API requests when joining', async ({ page }) => {
    let sessionDetailRequests = 0;
    let livekitTokenRequests = 0;
    let statusUpdateRequests = 0;

    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.log(`[browser:${message.type()}] ${message.text()}`);
      }
    });

    // API client dùng prefix /api/v1/ (httpRequest baseURL); chấp nhận cả /api/ cũ
    await page.route(/\/api\/(v1\/)?common\/configs/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.route(/\/api\/(v1\/)?common\/all-careers/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, results: [] }),
      });
    });

    await page.route(/\/api\/(v1\/)?interview\/web\/sessions\/invite\/demo-invite\/$/, async (route) => {
      sessionDetailRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 123,
          invite_token: 'demo-invite',
          room_name: 'room-demo',
          status: 'scheduled',
          type: 'mixed',
          candidate_name: 'Nguyen Van A',
          candidate_email: 'candidate@example.com',
          job_name: 'Backend Engineer',
          company_name: 'Square',
          scheduled_at: '2026-05-21T03:00:00Z',
          transcripts: [],
          evaluations: [],
          questions: [{ id: 1, text: 'Introduce yourself' }],
        }),
      });
    });

    await page.route(/\/api\/(v1\/)?interview\/web\/sessions\/invite\/demo-invite\/livekit-token\/$/, async (route) => {
      livekitTokenRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-livekit-token',
          serverUrl: 'ws://localhost:3000/livekit',
          roomName: 'room-demo',
        }),
      });
    });

    await page.route(/\/api\/(v1\/)?interview\/web\/sessions\/room-demo\/status\/$/, async (route) => {
      statusUpdateRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 123,
          invite_token: 'demo-invite',
          room_name: 'room-demo',
          status: 'in_progress',
        }),
      });
    });

    // Cổng sẵn sàng TTS/STT (warmup) trước khi vào phòng
    await page.route(/\/api\/(v1\/)?interview\/web\/sessions\/[^/]+\/warmup\/$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tts: 'ready', stt: 'ready' }),
      });
    });

    // Giả lập LiveKit WebSocket luôn mở (không cần LiveKit server thật)
    await page.routeWebSocket(/.*livekit.*/, () => {
      // giữ kết nối mở, không đóng
    });

    // Tắt tour hướng dẫn phòng phỏng vấn để overlay không che HUD
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_interview_ai_live', 'true');
      } catch {}
    });

    await page.goto('/interview/demo-invite', { waitUntil: 'domcontentloaded' });

    const startButton = page.locator('button').filter({ hasText: /Bắt đầu|Báº¯t|Start/i }).first();
    await expect(startButton).toBeVisible({ timeout: 20_000 });
    await startButton.click();

    // Nút vào phòng: ưu tiên data-testid ổn định (copy hiện tại: "Vào phòng phỏng vấn ...")
    const joinButton = page
      .getByTestId('join-interview-room-btn')
      .or(page.locator('button').filter({ hasText: /Vào phòng|Tham gia|Join/i }))
      .first();
    await expect(joinButton).toBeEnabled({ timeout: 20_000 });
    await joinButton.click();

    await expect(
      page
        .getByTestId('end-interview-btn')
        .or(page.locator('button').filter({ hasText: /Kết thúc|Káº¿t thÃºc|End/i }))
        .first()
    ).toBeVisible({
      timeout: 20_000,
    });
    await page.waitForTimeout(3_000);

    const timerDelay = await page.evaluate(async () => {
      const startedAt = performance.now();
      await new Promise((resolve) => window.setTimeout(resolve, 100));
      return performance.now() - startedAt;
    });

    expect(timerDelay).toBeLessThan(1_000);
    expect(sessionDetailRequests).toBeLessThanOrEqual(4);
    expect(livekitTokenRequests).toBe(1);
    expect(statusUpdateRequests).toBeLessThanOrEqual(1);
  });
});
