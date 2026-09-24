import type { Page } from '@playwright/test';
import { setupVoiceAiApiMocks } from '../helpers/mockApi';

export interface MockVoiceAiOptions {
  inviteToken?: string;
  roomName?: string;
  status?: 'scheduled' | 'in_progress' | 'completed';
  sessionType?: 'mock' | 'official';
  score?: number;
}

/**
 * Đăng ký các mock endpoints phục vụ luồng Voice AI AILA & LiveKit
 */
export async function setupDomainVoiceAiMocks(page: Page, options?: MockVoiceAiOptions) {
  await setupVoiceAiApiMocks(page, options);

  // Mock hoàn tất phỏng vấn và gửi câu trả lời
  await page.route(/\/api\/v1\/interview\/complete\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Buổi phỏng vấn đã kết thúc thành công. Đang phân tích kết quả.',
        }),
      });
      return;
    }
    await route.fallback();
  });
}
