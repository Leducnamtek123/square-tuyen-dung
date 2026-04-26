import { test, expect } from '@playwright/test';

test.describe('Interview recording smoke', () => {
  test('shows the recording video after the interview is completed', async ({ page }) => {
    const recordingUrl = 'http://minio:9000/square/interviews/demo/recording.mp4';
    const presignedUrl = 'http://localhost:9000/square/interviews/demo/recording.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=smoke-test';

    await page.context().addCookies([
      {
        name: 'access_token',
        value: 'fake-access-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.route('**/api/common/configs**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.route('**/api/common/all-careers**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, results: [] }),
      });
    });

    await page.route('**/api/auth/user-info-basic/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'employer@example.com',
          full_name: 'Employer HR',
          role_name: 'EMPLOYER',
          workspaces: [{ type: 'company', company_id: 10, label: 'Company', is_default: true }],
        }),
      });
    });

    await page.route('**/api/auth/user-workspaces/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workspaces: [{ type: 'company', company_id: 10, label: 'Company', is_default: true }],
        }),
      });
    });

    await page.route('**/api/interview/web/sessions/42/', async (route) => {
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

    await page.route('**/api/common/presign/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: presignedUrl,
        }),
      });
    });

    await page.goto('/employer/interviews/42');
    await expect(page.getByText('Ghi hình phỏng vấn')).toBeVisible();
    await expect(page.locator('video')).toBeVisible();
    await expect(page.locator('video')).toHaveAttribute('src', presignedUrl);
    await expect(page.locator(`a[href="${presignedUrl}"]`)).toBeVisible();
  });
});
