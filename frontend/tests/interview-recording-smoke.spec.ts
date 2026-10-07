import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from './mocks';
import { setupDomainEmployerMocks } from './mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from './helpers/auth';

test.describe('Interview recording smoke', () => {
  test('shows the recording video after the interview is completed', async ({ page, context }) => {
    const recordingUrl = 'http://minio:9000/square/interviews/demo/recording.mp4';
    const presignedUrl = 'http://localhost:9000/square/interviews/demo/recording.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=smoke-test';

    // Phiên đăng nhập nhà tuyển dụng dùng chung (cookie + mock auth/workspace) như các spec 03-employer
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_employer_interview_detail', 'true');
      } catch {}
    });

    // API client dùng prefix /api/v1/ (httpRequest baseURL); chấp nhận cả /api/ cũ
    await page.route(/\/api\/(v1\/)?common\/configs/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.route(/\/api\/(v1\/)?common\/all-careers/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, results: [] }),
      });
    });

    await page.route(/\/api\/(v1\/)?interview\/web\/sessions\/\?.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, results: [] }),
      });
    });

    await page.route(/\/api\/(v1\/)?interview\/web\/sessions\/42\/(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 42,
          room_name: 'room-42',
          status: 'completed',
          type: 'mixed',
          candidate_name: 'Nguyen Van A',
          candidate_email: 'candidate@example.com',
          job_name: 'Backend Engineer',
          company_name: 'Square',
          scheduled_at: '2026-04-26T03:00:00Z',
          start_time: '2026-04-26T03:00:00Z',
          end_time: '2026-04-26T03:30:00Z',
          duration: 1800,
          recording_url: recordingUrl,
          transcripts: [],
          evaluations: [],
          questions: [],
        }),
      });
    });

    await page.route(/\/api\/(v1\/)?common\/presign\//, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: presignedUrl,
        }),
      });
    });

    await page.goto('/employer/interviews/42', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Ghi hình phỏng vấn').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('video')).toBeVisible();
    await expect(page.locator('video')).toHaveAttribute('src', presignedUrl);
    await expect(page.locator(`a[href="${presignedUrl}"]`)).toBeVisible();
  });
});
