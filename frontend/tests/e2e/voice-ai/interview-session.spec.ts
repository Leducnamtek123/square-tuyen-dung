import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupAuthApiMocks } from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Voice AI Interview E2E Flow', () => {
  const inviteToken = 'e2e-voice-ai-invite';
  const roomName = 'room-e2e-voice-ai';

  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Mock interview session detail
    await page.route(new RegExp(`/api/interview/web/sessions/invite/${inviteToken}/$`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 777,
          invite_token: inviteToken,
          room_name: roomName,
          status: 'scheduled',
          type: 'mixed',
          candidate_name: 'Nguyen Van Ung Vien',
          candidate_email: 'candidate.e2e@infohr.vn',
          job_name: 'Senior Fullstack Engineer',
          company_name: 'InfoHR Tech Corp',
          scheduled_at: '2026-09-25T10:00:00Z',
          transcripts: [],
          evaluations: [],
          questions: [
            { id: 1, text: 'Bạn hãy giới thiệu về bản thân và kinh nghiệm làm việc nổi bật.' },
          ],
        }),
      });
    });

    // Mock livekit token
    await page.route(new RegExp(`/api/interview/web/sessions/invite/${inviteToken}/livekit-token/`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'e2e-fake-livekit-token',
          serverUrl: 'ws://localhost:3000/livekit',
          roomName: roomName,
        }),
      });
    });

    // Mock room status update
    await page.route(new RegExp(`/api/interview/web/sessions/${roomName}/status/`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 777,
          invite_token: inviteToken,
          room_name: roomName,
          status: 'in_progress',
        }),
      });
    });
  });

  test('Candidate enters interview room, validates pre-join screen and joins session', async ({ page }) => {
    await page.goto(`/interview/${inviteToken}`);

    // Pre-join screen should show job title and company
    await expect(page.getByText('Senior Fullstack Engineer').first()).toBeVisible({ timeout: 20_000 });

    // Start button initiates pre-call checks
    const startBtn = page.locator('button').filter({ hasText: /bắt đầu|start/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 15_000 });
    await startBtn.click();

    // Join button becomes enabled
    const joinBtn = page.locator('button').filter({ hasText: /tham gia|join/i }).first();
    await expect(joinBtn).toBeEnabled({ timeout: 15_000 });
    await joinBtn.click();

    // Active room controls should become visible (End interview / Kết thúc)
    const endBtn = page.locator('button').filter({ hasText: /kết thúc|end/i }).first();
    await expect(endBtn).toBeVisible({ timeout: 20_000 });
  });
});
