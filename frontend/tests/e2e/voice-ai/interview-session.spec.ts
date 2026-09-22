import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupCandidateProfileApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupVoiceAiApiMocks,
  MOCK_COMPANY_QUESTION_SETS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('Voice AI Interview E2E Flow', () => {
  const inviteToken = 'e2e-voice-ai-invite';
  const roomName = 'room-e2e-voice-ai';

  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: DEFAULT_CANDIDATE.id,
      email: DEFAULT_CANDIDATE.email,
      fullName: DEFAULT_CANDIDATE.fullName,
    });
    await injectSession(context, DEFAULT_CANDIDATE);
  });

  test('Candidate can browse practice question sets and initialize AI mock practice session on /practice', async ({ page }) => {
    await setupVoiceAiApiMocks(page);

    await page.goto('/practice');
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    // Verify company question set item renders
    const firstSet = MOCK_COMPANY_QUESTION_SETS[0];
    const setItem = page.getByText(firstSet.name).or(page.getByText(/bộ câu hỏi/i)).first();
    await expect(setItem).toBeVisible({ timeout: 20_000 });

    // Click "Luyện tập bộ này với AI"
    const startSetBtn = page.getByRole('button', { name: /luyện tập bộ này với ai|bắt đầu/i })
      .or(page.getByTestId('start-set-mock-btn'))
      .first();
    await expect(startSetBtn).toBeVisible({ timeout: 15_000 });
    await startSetBtn.click();

    // Verify redirection to interview room
    await expect(page).toHaveURL(/.*interview\/.*/, { timeout: 20_000 });
  });

  test('Candidate validates pre-flight media checks with fake audio/video devices on /interview/[id]', async ({ page }) => {
    await setupVoiceAiApiMocks(page, { inviteToken, roomName, status: 'scheduled' });

    await page.goto(`/interview/${inviteToken}`);
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    // Pre-join waiting screen should show job title and candidate name
    await expect(page.getByText('Senior Fullstack Engineer').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Nguyen Van Ung Vien').first()).toBeVisible({ timeout: 20_000 });

    // Start button initiates pre-call checks
    const startBtn = page.getByRole('button', { name: /bắt đầu phỏng vấn|bắt đầu luyện tập|bắt đầu/i })
      .or(page.getByTestId('start-interview-btn'))
      .first();
    await expect(startBtn).toBeVisible({ timeout: 15_000 });
    await startBtn.click();

    // Preflight room appears with company name and Join button
    await expect(page.getByText('InfoHR Tech Corp').or(page.getByText(/aila|trợ lý ai|kiểm tra/i)).first()).toBeVisible({ timeout: 20_000 });
    const joinBtn = page.getByTestId('join-interview-room-btn')
      .or(page.getByTestId('skip-check-and-join-btn'))
      .or(page.locator('button').filter({ hasText: /vào phòng|luyện tập|tham gia|bỏ qua|join/i }))
      .first();
    await expect(joinBtn).toBeVisible({ timeout: 20_000 });
  });

  test('Candidate joins live LiveKit room, views Question Card HUD, controls media and ends session', async ({ page }) => {
    await setupVoiceAiApiMocks(page, { inviteToken, roomName, status: 'scheduled' });

    await page.goto(`/interview/${inviteToken}`);
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    // Enter preflight
    const startBtn = page.getByRole('button', { name: /bắt đầu phỏng vấn|bắt đầu luyện tập|bắt đầu/i })
      .or(page.getByTestId('start-interview-btn'))
      .first();
    await expect(startBtn).toBeVisible({ timeout: 15_000 });
    await startBtn.click();

    // Join room (or skip preflight checks if needed)
    const joinBtn = page.getByTestId('join-interview-room-btn')
      .or(page.getByTestId('skip-check-and-join-btn'))
      .or(page.locator('button').filter({ hasText: /vào phòng|luyện tập|tham gia|bỏ qua|join/i }))
      .first();
    await expect(joinBtn).toBeVisible({ timeout: 20_000 });
    await joinBtn.click();

    // Active room HUD should appear: Question Card with question text or room layout
    const questionCard = page.getByTestId('interview-question-card')
      .or(page.getByText('Bạn hãy giới thiệu về bản thân'))
      .or(page.getByText(/phỏng vấn trực tuyến|bản ghi|aila/i))
      .first();
    await expect(questionCard).toBeVisible({ timeout: 25_000 });

    // Media Controls: Toggle mic & cam
    const toggleMicBtn = page.getByRole('button', { name: /mic|micrô|tắt mic|bật mic/i })
      .or(page.getByTestId('toggle-mic-btn'))
      .first();
    if (await toggleMicBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await toggleMicBtn.click();
    }

    const toggleCamBtn = page.getByRole('button', { name: /máy ảnh|camera|tắt camera|bật camera/i })
      .or(page.getByTestId('toggle-cam-btn'))
      .first();
    if (await toggleCamBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await toggleCamBtn.click();
    }

    // End Interview Flow
    const endBtn = page.getByRole('button', { name: /kết thúc|dừng/i })
      .or(page.getByTestId('end-interview-btn'))
      .first();
    await expect(endBtn).toBeVisible({ timeout: 15_000 });
    await endBtn.click();

    // Confirmation dialog opens
    const confirmEndBtn = page.getByRole('button', { name: /xác nhận|kết thúc ngay|đồng ý/i })
      .or(page.getByTestId('confirm-end-interview-btn'))
      .last();
    if (await confirmEndBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmEndBtn.click();
    }
  });

  test('Candidate reviews completed interview evaluation with AI score breakdown and video recording', async ({ page }) => {
    await setupVoiceAiApiMocks(page, {
      inviteToken,
      roomName,
      status: 'completed',
      sessionType: 'mock',
    });

    await page.goto(`/interview/${inviteToken}`);
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    // Verify Evaluation Summary renders
    await expect(page.getByText(/kết quả luyện tập|kết quả phỏng vấn/i).first()).toBeVisible({ timeout: 20_000 });

    // Verify AI strengths & weaknesses
    await expect(page.getByText(/điểm mạnh nổi bật/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/khu vực cần cải thiện/i).first()).toBeVisible({ timeout: 15_000 });

    // Verify video recording component
    await expect(page.locator('video').or(page.getByText(/bản ghi video/i)).first()).toBeVisible({ timeout: 15_000 });
  });
});
