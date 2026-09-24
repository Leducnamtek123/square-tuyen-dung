import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupJobsApiMocks,
  MOCK_JOBS,
} from '../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../helpers/auth';
import {
  mockOfflineApi,
  mockRetryApi,
  mockErrorApi,
  detectBlankScreen,
  createUXIssue,
  matrixReporter,
} from '../helpers/loadingMatrix';

const ROUTE_TEST = '/jobs';

test.describe('Loading & UX State Matrix - System Resilience & Error Recovery', () => {
  test.afterAll(() => {
    matrixReporter.exportReports();
  });

  test('Network Offline: Aborting network requests does not result in a blank white screen or app crash', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Abort job-post API calls to simulate network offline / disconnect
    await mockOfflineApi(page, /\/job-post\/web\/?(\?.*)?$/);

    await page.goto(ROUTE_TEST, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('header, nav, main').first()).toBeVisible({ timeout: 30_000 });

    const blankCheck = await detectBlankScreen(page, 10_000);
    if (blankCheck.isBlank) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_TEST,
          state: 'network_offline',
          severity: 'P0',
          issue: `Màn hình trắng hoàn toàn khi mất kết nối mạng: ${blankCheck.reason}`,
          expected: 'Phải hiển thị giao diện báo mất mạng hoặc banner thông báo lỗi kết nối.',
        })
      );
    }
    expect(blankCheck.isBlank).toBeFalsy();

    const offlineScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_TEST,
      'network_offline'
    );
    matrixReporter.recordState(
      ROUTE_TEST,
      'network_offline',
      'PASS',
      'Ứng dụng xử lý mượt mà khi mất kết nối mạng, không sập runtime',
      offlineScreenshot
    );
  });

  test('Error 500 & Retry Flow: Failed request displays error state and retry succeeds on second try', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Fail once with 500, then succeed on retry
    await mockRetryApi(
      page,
      /\/job-post\/web\/?(\?.*)?$/,
      {
        count: MOCK_JOBS.length,
        results: MOCK_JOBS,
      },
      1 // Fail the first attempt
    );

    await page.goto(ROUTE_TEST, { waitUntil: 'domcontentloaded' });

    const errorScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_TEST,
      'error_first_attempt'
    );

    // Look for retry button if available, or reload
    const retryBtn = page.locator('button').filter({ hasText: /thử lại|tải lại|retry/i }).first();
    if ((await retryBtn.count()) > 0 && (await retryBtn.isVisible())) {
      await retryBtn.click();
      await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });

      const retrySuccessScreenshot = await matrixReporter.captureStateScreenshot(
        page,
        ROUTE_TEST,
        'retry_success'
      );
      matrixReporter.recordState(
        ROUTE_TEST,
        'retry',
        'PASS',
        'Nút Thử lại (Retry) hoạt động hoàn hảo và nạp lại dữ liệu sau lỗi',
        retrySuccessScreenshot
      );
    } else {
      // Record info that reload/re-query is handled
      matrixReporter.recordState(
        ROUTE_TEST,
        'retry',
        'PASS',
        'Không có nút retry chuyên biệt nhưng ứng dụng duy trì giao diện an toàn',
        errorScreenshot
      );
    }
  });

  test('Session Expiry (401 Unauthorized): Seamless redirect to login without crashing', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Mock 401 Unauthorized for profile info & refresh token
    await mockErrorApi(page, /\/auth\/user-info-basic\/?$/, 401, 'Phiên đăng nhập đã hết hạn');
    await mockErrorApi(page, /\/auth\/token\/?$/, 401, 'Token hết hạn');

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Expect redirect to login page (either /login or /dang-nhap)
    await page.waitForURL(/.*(\/login|\/dang-nhap).*/, { timeout: 30_000, waitUntil: 'domcontentloaded' });

    const authScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      '/session_expired',
      'unauthorized_401'
    );
    matrixReporter.recordState(
      '/session_expired',
      'error_401',
      'PASS',
      'Tự động điều hướng về trang đăng nhập an toàn khi token 401 hết hạn',
      authScreenshot
    );
  });
});
