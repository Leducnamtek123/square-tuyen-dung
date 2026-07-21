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

    await page.route('**/api/common/configs**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.route('**/api/common/all-careers**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, results: [] }),
      });
    });

    await page.route(/\/api\/interview\/web\/sessions\/invite\/demo-invite\/$/, async (route) => {
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

    await page.route(/\/api\/interview\/web\/sessions\/invite\/demo-invite\/livekit-token\/$/, async (route) => {
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

    await page.route(/\/api\/interview\/web\/sessions\/room-demo\/status\/$/, async (route) => {
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

    await page.goto('/interview/demo-invite', { waitUntil: 'domcontentloaded' });

    const startButton = page.locator('button').filter({ hasText: /Bắt đầu|Báº¯t|Start/i }).first();
    await expect(startButton).toBeVisible({ timeout: 20_000 });
    await startButton.click();

    const joinButton = page.locator('button').filter({ hasText: /Tham gia|Join/i }).first();
    await expect(joinButton).toBeEnabled({ timeout: 20_000 });
    await joinButton.click();

    await expect(page.locator('button').filter({ hasText: /Kết thúc|Káº¿t thÃºc|End/i }).first()).toBeVisible({
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
